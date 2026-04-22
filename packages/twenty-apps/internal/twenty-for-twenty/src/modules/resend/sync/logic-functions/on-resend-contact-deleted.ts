import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordDeleteEvent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { ON_RESEND_CONTACT_DELETED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import type { ResendContactRecord } from 'src/modules/resend/shared/types/resend-contact-record';
import { getResendClient } from 'src/modules/resend/shared/utils/get-resend-client';

type ContactDeleteEvent = DatabaseEventPayload<
  ObjectRecordDeleteEvent<ResendContactRecord>
>;

const handler = async (
  event: ContactDeleteEvent,
): Promise<object | undefined> => {
  const resendId = event.properties.before?.resendId;

  if (!isNonEmptyString(resendId)) {
    return { skipped: true, reason: 'no resendId on record' };
  }

  const resend = getResendClient();

  const { error } = await resend.contacts.remove({ id: resendId });

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
  universalIdentifier: ON_RESEND_CONTACT_DELETED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-contact-deleted',
  description:
    'Removes a contact from Resend when a resendContact record is deleted in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendContact.deleted',
  },
});
