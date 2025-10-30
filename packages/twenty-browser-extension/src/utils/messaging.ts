import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  getPersonviaRelay(): {firstName: string; lastName: string }
  openPopup(): void;
  extractPerson(): {firstName: string; lastName: string}
  getCompanyviaRelay(): {companyName: string}
  extractCompany(): {companyName: string}
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
