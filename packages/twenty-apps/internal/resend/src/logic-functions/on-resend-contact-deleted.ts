import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import { getResendClient } from 'src/utils/get-resend-client';

type ResendContactRecord = {
  id: string;
  resendId?: string;
};

type ContactDeleteEvent = DatabaseEventPayload<
  ObjectRecordDeleteEvent<ResendContactRecord>
>;

const handler = async (
  event: ContactDeleteEvent,
): Promise<object | undefined> => {
  const resendId = event.properties.before?.resendId;

  if (!isDefined(resendId) || resendId === '') {
    return { skipped: true, reason: 'no resendId on record' };
  }

  const resend = getResendClient();

  const { error } = await resend.contacts.remove(resendId);

  if (isDefined(error)) {
    const errorString = JSON.stringify(error);

    if (errorString.includes('not_found')) {
      return { skipped: true, reason: 'contact already deleted on Resend' };
    }

    throw new Error(
      `Failed to delete Resend contact ${resendId}: ${errorString}`,
    );
  }

  return { synced: true, resendId, action: 'deleted' };
};

export default defineLogicFunction({
  universalIdentifier: '7a2341e7-d96a-4ba1-b41d-699c73d61081',
  name: 'on-resend-contact-deleted',
  description:
    'Removes a contact from Resend when a resendContact record is deleted in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendContact.deleted',
  },
});
