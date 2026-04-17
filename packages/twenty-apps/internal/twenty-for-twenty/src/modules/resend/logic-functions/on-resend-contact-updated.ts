import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
  type EmailsField,
  type FullNameField,
} from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import { getResendClient } from 'src/modules/resend/utils/get-resend-client';

type ResendContactRecord = {
  id: string;
  resendId?: string;
  email?: EmailsField;
  name?: FullNameField;
  unsubscribed?: boolean;
  lastSyncedFromResend?: string;
};

type ContactUpdateEvent = DatabaseEventPayload<
  ObjectRecordUpdateEvent<ResendContactRecord>
>;

const handler = async (
  event: ContactUpdateEvent,
): Promise<object | undefined> => {
  if (event.properties.updatedFields?.includes('lastSyncedFromResend')) {
    return { skipped: true, reason: 'inbound sync echo' };
  }

  const { after } = event.properties;
  const resendId = after?.resendId;

  if (!isDefined(resendId) || resendId === '') {
    return { skipped: true, reason: 'no resendId on record' };
  }

  const resend = getResendClient();

  const updatePayload: Record<string, unknown> = { id: resendId };

  if (event.properties.updatedFields?.includes('unsubscribed')) {
    updatePayload.unsubscribed = after.unsubscribed;
  }

  if (event.properties.updatedFields?.includes('name')) {
    updatePayload.firstName = after.name?.firstName ?? null;
    updatePayload.lastName = after.name?.lastName ?? null;
  }

  if (event.properties.updatedFields?.includes('email')) {
    updatePayload.email = after.email?.primaryEmail;
  }

  if (Object.keys(updatePayload).length <= 1) {
    return { skipped: true, reason: 'no relevant fields changed' };
  }

  const { error } = await resend.contacts.update(
    updatePayload as Parameters<typeof resend.contacts.update>[0],
  );

  if (isDefined(error)) {
    throw new Error(
      `Failed to update Resend contact ${resendId}: ${JSON.stringify(error)}`,
    );
  }

  return {
    synced: true,
    resendId,
    updatedFields: Object.keys(updatePayload).filter((k) => k !== 'id'),
  };
};

export default defineLogicFunction({
  universalIdentifier: '7b770cc2-6d31-4f1b-a7db-48d44cf6109b',
  name: 'on-resend-contact-updated',
  description:
    'Pushes contact field changes to Resend when a resendContact record is updated in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendContact.updated',
    updatedFields: ['unsubscribed', 'name', 'email'],
  },
});
