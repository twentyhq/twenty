import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction, type InstallPayload } from 'twenty-sdk/define';
import { compare } from 'semver'

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { runLastContactBackfill } from 'src/utils/run-last-contact-backfill';
import { isDefined } from 'twenty-sdk/utils';

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
    JSON.stringify({ batchSize: getBackfillBatchSize() }),
  );

  const phases = await runLastContactBackfill(new CoreApiClient());

  return { outcome: 'completed', phases };
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Backfills last-contact fields on people, then opportunities, then companies after installation, one batch of records at a time within this run.',
  timeoutSeconds: 900,
  shouldRunOnVersionUpgrade: true,
  handler,
});
