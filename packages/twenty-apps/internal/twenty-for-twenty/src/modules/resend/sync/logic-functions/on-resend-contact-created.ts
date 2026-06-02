import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';
import { isDefined } from '@utils/is-defined';

import { ON_RESEND_CONTACT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import type { ResendContactRecord } from '@modules/resend/shared/types/resend-contact-record';
import { findOrCreatePerson } from '@modules/resend/shared/utils/find-or-create-person';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';

type ContactCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<ResendContactRecord>
>;

const handler = async (
  event: ContactCreateEvent,
): Promise<object | undefined> => {
  const { after } = event.properties;

  if (isNonEmptyString(after.resendId)) {
    return {
      skipped: true,
      reason: 'record already has resendId (inbound sync)',
    };
  }

  const email = after.email?.primaryEmail;

  if (!isNonEmptyString(email)) {
    return { skipped: true, reason: 'no email on record' };
  }

  const resendClient = getResendClient();

  const { data, error } = await resendClient.contacts.create({
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

  return {
    synced: true,
    resendId: data.id,
    twentyId: event.recordId,
    personId,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    ON_RESEND_CONTACT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-contact-created',
  description:
    'Creates a contact in Resend when a new resendContact record is created in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendContact.created',
  },
});
