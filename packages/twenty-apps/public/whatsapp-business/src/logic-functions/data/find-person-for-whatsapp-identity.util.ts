import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';
import { type WhatsAppPerson } from 'src/logic-functions/types/whatsapp-person.type';

// the BSUID wins because it stays stable when a user hides or changes their number
export const findPersonForWhatsAppIdentity = ({
  people,
  identity,
}: {
  people: WhatsAppPerson[];
  identity: WhatsAppIdentity;
}): WhatsAppPerson | undefined =>
  (isNonEmptyString(identity.whatsAppUserId)
    ? people.find(({ whatsAppUserId }) => whatsAppUserId === identity.whatsAppUserId)
    : undefined) ??
  (isNonEmptyString(identity.whatsAppId)
    ? people.find(({ whatsAppId }) => whatsAppId === identity.whatsAppId)
    : undefined);
