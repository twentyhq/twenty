import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';

import { GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueGoogleMeetDiscoveriesOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util';

type GoogleMeetRegisterConnectionResult =
  | { success: true }
  | { success: false; error: string };

export const googleMeetRegisterConnectionHandler = async ({
  connectedAccountId,
}: {
  connectedAccountId?: string;
}): Promise<GoogleMeetRegisterConnectionResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    return { success: false, error: 'Invalid Google Meet connection hook' };
  }

  await enqueueGoogleMeetDiscoveriesOrThrow({
    connectedAccountIds: [connectedAccountId],
    trigger: 'connect',
    now: new Date(),
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-register-connection',
  description:
    'Queues the discovery of recent Google Meet conferences right after a Google account is connected.',
  timeoutSeconds: 30,
  handler: googleMeetRegisterConnectionHandler,
});
