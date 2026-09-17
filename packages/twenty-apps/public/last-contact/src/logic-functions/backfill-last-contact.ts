import { compare } from 'semver'
import { definePostInstallLogicFunction, type InstallPayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { startBackfill } from 'src/utils/start-backfill';

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

const handler = async (payload: InstallPayload): Promise<object> => {
  if(!shouldRunPostInstall(payload)) {
    console.log('Post install skipped');

    return {}
  }

  return startBackfill();
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
