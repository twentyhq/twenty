import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import { isDefined } from '@utils/is-defined';

import { ON_RESEND_CONTACT_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import type { ResendContactRecord } from '@modules/resend/shared/types/resend-contact-record';
import { findOrCreatePerson } from '@modules/resend/shared/utils/find-or-create-person';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';

type ContactUpdateEvent = DatabaseEventPayload<
  ObjectRecordUpdateEvent<ResendContactRecord>
>;

const valuesEqual = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const handler = async (
  event: ContactUpdateEvent,
): Promise<object | undefined> => {
  const { before, after } = event.properties;

  const lastSyncedChanged = !valuesEqual(
    before?.lastSyncedFromResend,
    after?.lastSyncedFromResend,
  );

  const unsubscribedChanged = !valuesEqual(
    before?.unsubscribed,
    after?.unsubscribed,
  );
  const nameChanged = !valuesEqual(before?.name, after?.name);
  const emailChanged = !valuesEqual(before?.email, after?.email);
  const userFieldsChanged = unsubscribedChanged || nameChanged || emailChanged;

  if (lastSyncedChanged && !userFieldsChanged) {
    return { skipped: true, reason: 'inbound sync echo' };
  }

  const resendId = after?.resendId;

  if (!isNonEmptyString(resendId)) {
    return { skipped: true, reason: 'no resendId on record' };
  }

  const resendClient = getResendClient();

  const updatePayload: Record<string, unknown> = { id: resendId };

  if (unsubscribedChanged) {
    updatePayload.unsubscribed = after.unsubscribed;
  }

  if (nameChanged) {
    updatePayload.firstName = after.name?.firstName ?? null;
    updatePayload.lastName = after.name?.lastName ?? null;
  }

  if (emailChanged) {
    updatePayload.email = after.email?.primaryEmail;
  }

  if (Object.keys(updatePayload).length <= 1) {
    return { skipped: true, reason: 'no relevant fields changed' };
  }

  const { error } = await resendClient.contacts.update(
    updatePayload as Parameters<typeof resendClient.contacts.update>[0],
  );

  if (isDefined(error)) {
    throw new Error(
      `Failed to update Resend contact ${resendId}: ${JSON.stringify(error)}`,
    );
  }

  let personId: string | undefined;

  if (emailChanged) {
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
    updatedFields: Object.keys(updatePayload).filter(
      (payloadKey) => payloadKey !== 'id',
    ),
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
