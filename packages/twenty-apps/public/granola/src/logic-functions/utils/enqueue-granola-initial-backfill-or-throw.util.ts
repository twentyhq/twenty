import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import {
  GRANOLA_INITIAL_IMPORT_DAYS,
  GRANOLA_MILLISECONDS_PER_DAY,
} from 'src/constants/granola-history.constant';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { enqueueGranolaBackfillOrThrow } from 'src/logic-functions/utils/enqueue-granola-backfill-or-throw.util';

export const enqueueGranolaInitialBackfillOrThrow = async (
  registration: Pick<
    GranolaWebhookRegistration,
    'registrationId' | 'folderIds' | 'isInitialBackfillEnqueued'
  >,
): Promise<void> => {
  if (registration.isInitialBackfillEnqueued) {
    return;
  }

  await enqueueGranolaBackfillOrThrow({
    createdAfter: new Date(
      Date.now() - GRANOLA_INITIAL_IMPORT_DAYS * GRANOLA_MILLISECONDS_PER_DAY,
    ).toISOString(),
    folderIds: registration.folderIds,
  });

  const currentRegistration = await kv.get<GranolaWebhookRegistration>(
    GRANOLA_WEBHOOK_REGISTRATION_KEY,
  );

  if (
    isDefined(currentRegistration) &&
    currentRegistration.registrationId === registration.registrationId
  ) {
    await kv.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, {
      ...currentRegistration,
      isInitialBackfillEnqueued: true,
    });
  }
};
