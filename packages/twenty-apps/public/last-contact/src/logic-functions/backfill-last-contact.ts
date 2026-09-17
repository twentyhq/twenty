import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction, type InstallPayload } from 'twenty-sdk/define';
import { compare } from 'semver'

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  getBackfillBatchSize,
  getBackfillSleepMs,
} from 'src/utils/backfill-settings';
import { enqueueBackfillJobs } from 'src/utils/enqueue-backfill-jobs';
import { isDefined } from 'twenty-sdk/utils';

const shouldRunPostInstall = ({
  previousVersion,
  newVersion
}: InstallPayload): boolean  => {
  if(!isDefined(previousVersion)) { // Fresh install
    return true;
  }

  if (compare(previousVersion, "1.4.0") < 0 && compare(newVersion, "1.4.0") >= 1) { // Rate limitation fix
    return true;
  }

  return false
}

const handler = async ({
   previousVersion,
   newVersion
}: InstallPayload): Promise<object> => {
  if(!shouldRunPostInstall({
    previousVersion,
    newVersion
  })) {
    console.log('Post install skipped');

    return {}
  }

  console.log(
    'Backfill params',
    JSON.stringify({
      batchSize: getBackfillBatchSize(),
      sleepMs: getBackfillSleepMs(),
    }),
  );

  const plans = await enqueueBackfillJobs(new CoreApiClient());

  return { outcome: 'enqueued', plans };
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Counts people, opportunities and companies after installation and enqueues one backfill job per record batch.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: true,
  handler,
});
