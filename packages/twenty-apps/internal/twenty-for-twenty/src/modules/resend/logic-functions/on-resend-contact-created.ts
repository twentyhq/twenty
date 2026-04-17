import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
  type EmailsField,
  type FullNameField,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import { findOrCreatePerson } from 'src/modules/resend/utils/find-or-create-person';
import { getResendClient } from 'src/modules/resend/utils/get-resend-client';

type ResendContactRecord = {
  id: string;
  resendId?: string;
  email?: EmailsField;
  name?: FullNameField;
  unsubscribed?: boolean;
};

type ContactCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<ResendContactRecord>
>;

const handler = async (
  event: ContactCreateEvent,
): Promise<object | undefined> => {
  const { after } = event.properties;

  if (isDefined(after.resendId) && after.resendId !== '') {
    return { skipped: true, reason: 'record already has resendId (inbound sync)' };
  }

  const email = after.email?.primaryEmail;

  if (!isDefined(email) || email === '') {
    return { skipped: true, reason: 'no email on record' };
  }

  const resend = getResendClient();

  const { data, error } = await resend.contacts.create({
    email,
    firstName: after.name?.firstName ?? undefined,
    lastName: after.name?.lastName ?? undefined,
    unsubscribed: after.unsubscribed ?? false,
  });

  if (isDefined(error) || !isDefined(data)) {
    throw new Error(
      `Failed to create Resend contact: ${JSON.stringify(error)}`,
    );
  }

  const client = new CoreApiClient();

  const personId = await findOrCreatePerson(client, email, {
    firstName: after.name?.firstName ?? undefined,
    lastName: after.name?.lastName ?? undefined,
  });

  await client.mutation({
    updateResendContact: {
      __args: {
        id: event.recordId,
        data: {
          resendId: data.id,
          lastSyncedFromResend: new Date().toISOString(),
          ...(isDefined(personId) && { personId }),
        },
      },
      id: true,
    },
  });

  return { synced: true, resendId: data.id, twentyId: event.recordId, personId };
};

export default defineLogicFunction({
  universalIdentifier: '656b85b4-71d0-477b-9741-4967d8d88ac9',
  name: 'on-resend-contact-created',
  description:
    'Creates a contact in Resend when a new resendContact record is created in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendContact.created',
  },
});
