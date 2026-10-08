import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction, type InstallPayload } from 'twenty-sdk/define';
import { enqueueJobs } from 'twenty-sdk/logic-function';
import { compare } from 'semver'

import {
  BACKFILL_MIN_CALL_INTERVAL_MS,
  BACKFILL_RATE_LIMITED_RESUME_DELAY_MS,
  BACKFILL_RUN_BUDGET_MS,
} from 'src/constants/backfill';
import { MEETING_INSTALL_LOOKBACK_MS } from 'src/constants/meeting-schedule';
import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { applyMeetingInteractions } from 'src/utils/apply-meeting-interactions';
import { collectPersonMeetingParticipants } from 'src/utils/collect-person-meeting-participants';
import { createPacedClient } from 'src/utils/create-paced-client';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { scheduleUpcomingPersonMeetings } from 'src/utils/schedule-meetings';
import {
  type BackfillCursor,
  runLastContactBackfill,
} from 'src/utils/run-last-contact-backfill';
import { isDefined } from 'twenty-sdk/utils';

// A run that stops before the end enqueues this function again with the
// cursor to resume from.
type BackfillPayload = InstallPayload & { resumeFrom?: BackfillCursor };

const shouldRunPostInstall = ({
  previousVersion,
  newVersion
}: InstallPayload): boolean  => {
  if(!isDefined(previousVersion)) { // Fresh install
    return true;
  }

  if (compare(previousVersion, "1.5.0") <= 0 && compare(newVersion, "1.6.0") >= 0) { // Rate limitation fix
    return true;
  }

  return false
}

const handler = async (payload: BackfillPayload): Promise<object> => {
  const deadlineMs = Date.now() + BACKFILL_RUN_BUDGET_MS;
  const client = createPacedClient(
    new CoreApiClient(),
    BACKFILL_MIN_CALL_INTERVAL_MS,
  );
  const { resumeFrom } = payload;

  if (!isDefined(resumeFrom)) {
    await scheduleUpcomingPersonMeetings(client);

    const recentlyStartedParticipants = await collectPersonMeetingParticipants(
      client,
      { from: new Date(Date.now() - MEETING_INSTALL_LOOKBACK_MS), to: new Date() },
    );

    await applyMeetingInteractions(client, recentlyStartedParticipants);

    if(!shouldRunPostInstall(payload)) {
      console.log('Post install skipped');

      return {}
    }

    console.log(
      'Backfill params',
      JSON.stringify({ batchSize: getBackfillBatchSize() }),
    );
  }

  const { phases, pause } = await runLastContactBackfill(client, {
    resumeFrom,
    deadlineMs,
  });

  if (!isDefined(pause)) {
    return { outcome: 'completed', phases };
  }

  console.log(
    'Backfill paused',
    JSON.stringify({ reason: pause.reason, resumeFrom: pause.resumeFrom }),
  );

  await executeWithRetry(() =>
    enqueueJobs({
      logicFunctionUniversalIdentifier:
        BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [{ payload: { resumeFrom: pause.resumeFrom } }],
      ...(pause.reason === 'rate-limited'
        ? { delayMs: BACKFILL_RATE_LIMITED_RESUME_DELAY_MS }
        : {}),
    }),
  );

  return { outcome: 'paused', phases, resumeFrom: pause.resumeFrom };
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Schedules upcoming meetings, then backfills last-contact fields on people, then opportunities, then companies after installation, one batch of records at a time at a paced call rate. A run that reaches its time budget or keeps getting rate limited enqueues itself to resume from where it stopped.',
  timeoutSeconds: 900,
  shouldRunOnVersionUpgrade: true,
  handler,
});
