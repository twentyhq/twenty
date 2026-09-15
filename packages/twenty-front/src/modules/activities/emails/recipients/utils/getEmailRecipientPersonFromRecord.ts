import { type EmailRecipientPerson } from '@/activities/emails/recipients/types/EmailRecipientPerson';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getEmailRecipientPersonFromRecord = (
  personRecord: ObjectRecord,
): EmailRecipientPerson => ({
  id: personRecord.id,
  firstName: personRecord.name?.firstName ?? '',
  lastName: personRecord.name?.lastName ?? '',
  avatarUrl: personRecord.avatarUrl ?? null,
  primaryEmail: personRecord.emails?.primaryEmail ?? '',
});
