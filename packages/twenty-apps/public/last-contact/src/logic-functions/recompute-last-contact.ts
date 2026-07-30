import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { RECOMPUTE_LOGIC_FUNCTION } from 'src/constants/universal-identifiers';
import { recomputeCompanies } from 'src/logic-functions/handlers/recompute-companies';
import { recomputeOpportunities } from 'src/logic-functions/handlers/recompute-opportunities';
import { recomputePeople } from 'src/logic-functions/handlers/recompute-people';
import {
  parseRecomputeRequest,
  type RecomputeInput,
} from 'src/logic-functions/utils/parse-recompute-request';
import { type RecomputeTargetName } from 'src/types/recompute-target';

const RECOMPUTE_BY_TARGET: Record<
  RecomputeTargetName,
  (client: CoreApiClient, recordIds: string[]) => Promise<number>
> = {
  person: recomputePeople,
  company: recomputeCompanies,
  opportunity: recomputeOpportunities,
};

export const handler = async (input: RecomputeInput) => {
  const parsed = parseRecomputeRequest(input);

  if (!parsed.isValid) {
    return new Response(
      { success: false, message: parsed.message },
      { status: 400 },
    );
  }

  const { objectNameSingular, recordIds } = parsed.request;

  if (recordIds.length === 0) {
    return { success: true, objectNameSingular, total: 0, updated: 0 };
  }

  const updated = await RECOMPUTE_BY_TARGET[objectNameSingular](
    new CoreApiClient(),
    recordIds,
  );

  return {
    success: true,
    objectNameSingular,
    total: recordIds.length,
    updated,
  };
};

export default defineLogicFunction({
  universalIdentifier: RECOMPUTE_LOGIC_FUNCTION.universalIdentifier,
  name: 'recompute-last-contact',
  description:
    'Recomputes the last-contact fields of up to 20 people, companies or opportunities from their current messages and calendar events.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: RECOMPUTE_LOGIC_FUNCTION.path,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
