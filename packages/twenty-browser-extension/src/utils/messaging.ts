import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  getPerson(): {firstName: string; lastName: string }
  openPopup(): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
