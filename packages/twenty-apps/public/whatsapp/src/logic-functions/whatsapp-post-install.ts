import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';
import { kv, listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_POST_INSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_CONTACTS_ONLY_DEFAULT_INTRODUCED_VERSION } from 'src/constants/whatsapp-contacts-only-default-introduced-version.constant';
import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { isVersionLowerThan } from 'src/logic-functions/utils/is-version-lower-than.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const whatsappPostInstallHandler = async ({
  previousVersion,
}: InstallPayload): Promise<{ keptOnAllChatsConnectionCount: number }> => {
  if (
    !isDefined(previousVersion) ||
    !isVersionLowerThan({
      version: previousVersion,
      targetVersion: WHATSAPP_CONTACTS_ONLY_DEFAULT_INTRODUCED_VERSION,
    })
  ) {
    return { keptOnAllChatsConnectionCount: 0 };
  }

  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });
  let keptOnAllChatsConnectionCount = 0;

  for (const connection of connections) {
    const settingsKey = getWhatsappConnectionKvKey({
      kind: 'settings',
      connectedAccountId: connection.id,
    });
    const storedSettings = await kv.get<Partial<WhatsappSettings>>(settingsKey);

    if (isDefined(storedSettings?.importPolicy)) {
      continue;
    }

    // These members were on All chats through the previous default, which nothing stored
    await kv.set(settingsKey, { ...storedSettings, importPolicy: 'ALL' });
    keptOnAllChatsConnectionCount += 1;
  }

  return { keptOnAllChatsConnectionCount };
};

export default definePostInstallLogicFunction({
  universalIdentifier: WHATSAPP_POST_INSTALL_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-post-install',
  description:
    'Keeps connections made before Contacts only became the default import policy on All chats.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: true,
  shouldRunSynchronously: false,
  handler: whatsappPostInstallHandler,
});
