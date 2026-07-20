import { createHash } from 'crypto';

import {
  CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_CRON_SPREAD_SECONDS_BY_PATTERN,
  CALL_RECORDER_SPREAD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/constants/call-recorder-cron-trigger-spread.constant';

const MILLISECONDS_PER_SECOND = 1000;

export const computeLogicFunctionCronTriggerSpreadDelay = ({
  workspaceId,
  applicationUniversalIdentifier,
  logicFunctionUniversalIdentifier,
  cronPattern,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  logicFunctionUniversalIdentifier: string;
  cronPattern: string;
}): number => {
  if (
    applicationUniversalIdentifier !==
      CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER ||
    !CALL_RECORDER_SPREAD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.has(
      logicFunctionUniversalIdentifier,
    )
  ) {
    return 0;
  }

  const spreadSeconds =
    CALL_RECORDER_CRON_SPREAD_SECONDS_BY_PATTERN.get(cronPattern);

  if (spreadSeconds === undefined) {
    return 0;
  }

  const spreadMilliseconds = spreadSeconds * MILLISECONDS_PER_SECOND;
  const hash = createHash('sha256')
    .update(`${workspaceId}:${logicFunctionUniversalIdentifier}`)
    .digest()
    .readUIntBE(0, 6);

  return hash % spreadMilliseconds;
};
