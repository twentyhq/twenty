import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { listMessageChannels } from 'twenty-sdk/logic-function';

import { LINKEDIN_POST_INSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { bindLinkedinMessagingProvider } from 'src/logic-functions/utils/bind-linkedin-messaging-provider.util';

export const linkedinPostInstallHandler = async (): Promise<{
  boundChannelCount: number;
}> => {
  const channels = await listMessageChannels();
  let boundChannelCount = 0;

  for (const channel of channels) {
    if (await bindLinkedinMessagingProvider(channel)) {
      boundChannelCount += 1;
    }
  }

  return { boundChannelCount };
};

export default definePostInstallLogicFunction({
  universalIdentifier: LINKEDIN_POST_INSTALL_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-post-install',
  description:
    'Lets members reply from Twenty in LinkedIn conversations connected before replies existed.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: true,
  shouldRunSynchronously: false,
  handler: linkedinPostInstallHandler,
});
