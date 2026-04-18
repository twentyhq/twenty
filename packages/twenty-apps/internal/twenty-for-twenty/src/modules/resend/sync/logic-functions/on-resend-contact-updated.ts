import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { ON_RESEND_CONTACT_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import type { ResendContactRecord } from 'src/modules/resend/shared/types/resend-contact-record';
import { findOrCreatePerson } from 'src/modules/resend/shared/utils/find-or-create-person';
import { getResendClient } from 'src/modules/resend/shared/utils/get-resend-client';

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

  if (!isNonEmptyString(resendId)) {
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

  let personId: string | undefined;

  if (event.properties.updatedFields?.includes('email')) {
    const email = after.email?.primaryEmail;
    const client = new CoreApiClient();

    personId = await findOrCreatePerson(client, email, {
      firstName: after.name?.firstName ?? undefined,
      lastName: after.name?.lastName ?? undefined,
    });

    if (isDefined(personId)) {
      await client.mutation({
        updateResendContact: {
          __args: { id: event.recordId, data: { personId } },
          id: true,
        },
      });
    }
  }

  return {
    synced: true,
    resendId,
    updatedFields: Object.keys(updatePayload).filter((k) => k !== 'id'),
    personId,
  };
};

export default defineLogicFunction({
  universalIdentifier: ON_RESEND_CONTACT_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
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
