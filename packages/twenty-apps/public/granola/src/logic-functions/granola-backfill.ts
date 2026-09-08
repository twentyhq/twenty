import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { GRANOLA_BACKFILL_ROUTE_PATH } from 'src/constants/granola-backfill-route-path';
import {
  GRANOLA_HISTORY_MAX_IMPORT_DAYS,
  GRANOLA_MILLISECONDS_PER_DAY,
} from 'src/constants/granola-history.constant';
import { GRANOLA_BACKFILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { enqueueGranolaBackfillOrThrow } from 'src/logic-functions/utils/enqueue-granola-backfill-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';

const GRANOLA_BACKFILL_INPUT_SCHEMA = z.object({
  days: z.number().int().min(1).max(GRANOLA_HISTORY_MAX_IMPORT_DAYS),
});

export const granolaBackfillHandler = async (
  payload: RoutePayload<unknown>,
) => {
  const parsed = GRANOLA_BACKFILL_INPUT_SCHEMA.safeParse(payload.body);

  if (!parsed.success) {
    return {
      success: false,
      error: `Choose a whole number of days between 1 and ${GRANOLA_HISTORY_MAX_IMPORT_DAYS}.`,
    };
  }

  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application settings permission is required.',
    };
  }

  const registration = await findGranolaRegistrationForCurrentKey();

  if (!isDefined(registration)) {
    return {
      success: false,
      error: 'Set up live sync before importing notes.',
    };
  }

  if (!registration.isActive) {
    return {
      success: false,
      error: 'Resume live sync before importing notes.',
    };
  }

  const result = await enqueueGranolaBackfillOrThrow({
    createdAfter: new Date(
      Date.now() - parsed.data.days * GRANOLA_MILLISECONDS_PER_DAY,
    ).toISOString(),
  });

  return { success: true, days: parsed.data.days, ...result };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_BACKFILL_UNIVERSAL_IDENTIFIER,
  name: 'granola-backfill',
  description:
    'Starts a paced import of Granola notes in the selected folders.',
  timeoutSeconds: 60,
  handler: granolaBackfillHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
