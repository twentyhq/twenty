import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordDestroyEvent } from 'twenty-sdk/define';
import { isDefined } from '@utils/is-defined';

import { ON_RESEND_CONTACT_DESTROYED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import type { ResendContactRecord } from '@modules/resend/shared/types/resend-contact-record';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';

type ContactDestroyEvent = DatabaseEventPayload<
  ObjectRecordDestroyEvent<ResendContactRecord>
>;

const handler = async (
  event: ContactDestroyEvent,
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

  return { synced: true, resendId, action: 'destroyed' };
};

export default defineLogicFunction({
  universalIdentifier: ON_RESEND_CONTACT_DESTROYED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-contact-destroyed',
  description:
    'Removes a contact from Resend when a resendContact record is permanently destroyed in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendContact.destroyed',
  },
});
