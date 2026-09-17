import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs } from 'twenty-sdk/logic-function';

import {
  GENERATE_ACCOUNT_BRIEF_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_STALE_BRIEFS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { BRIEF_TARGET_TYPES, type BriefTargetType } from 'src/constants/target-types';
import { SWEEP_MAX_TARGETS_PER_RUN } from 'src/logic-functions/constants/brief-sweep.constants';
import { findStaleBriefTargets, type StaleBriefTarget } from 'src/logic-functions/data/find-stale-brief-targets.util';

export const sweepStaleBriefsHandler = async (): Promise<object> => {
  const client = new CoreApiClient();
  const now = new Date();

  const targetsPerType = await Promise.all(
    BRIEF_TARGET_TYPES.map(async (targetType) =>
      findStaleBriefTargets({
        client,
        targetType,
        now,
        limit: SWEEP_MAX_TARGETS_PER_RUN,
      }),
    ),
  );

  const targets: StaleBriefTarget[] = targetsPerType.flat();

  if (targets.length === 0) {
    return { outcome: 'nothing-stale' };
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      GENERATE_ACCOUNT_BRIEF_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: targets.map((target) => ({
      targetType: target.targetType,
      recordId: target.recordId,
      displayName: target.displayName,
    })),
  });

  const byType = targets.reduce<Record<BriefTargetType, number>>(
    (counts, target) => {
      counts[target.targetType] += 1;
      return counts;
    },
    { company: 0, person: 0 },
  );

  return { outcome: 'jobs-enqueued', byType };
};

export default defineLogicFunction({
  universalIdentifier: SWEEP_STALE_BRIEFS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sweep-stale-briefs',
  description:
    'Nightly sweep: enqueues one brief generation job per Company or Person whose AI Brief is missing or stale.',
  timeoutSeconds: 600,
  handler: sweepStaleBriefsHandler,
  cronTriggerSettings: {
    pattern: '0 2 * * *',
  },
});
