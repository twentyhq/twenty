import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  getPersonviaRelay(): {firstName: string; lastName: string }
  openPopup(): void;
  extractPerson(): {firstName: string; lastName: string}
  getCompanyviaRelay(): {companyName: string}
  extractCompany(): {companyName: string}
  createPerson({firstName, lastName}: {firstName: string; lastName: string}): {firstName: string; lastName: string}
  createCompany({ name }: {name: string}): {name: string}
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
