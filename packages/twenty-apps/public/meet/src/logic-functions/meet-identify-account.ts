import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type IdentifyAccountPayload,
  type IdentifyAccountResult,
} from 'twenty-sdk/logic-function';

import { MEET_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_USER_INFO_URL } from 'src/logic-functions/constants/google-user-info.constant';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { type GoogleUserInfo } from 'src/logic-functions/types/google-user-info.type';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const meetIdentifyAccountHandler = async ({
  accessToken,
}: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const userInfo = await fetchMeetJson<GoogleUserInfo>({
    accessToken,
    url: GOOGLE_USER_INFO_URL,
  });

  if (!isNonEmptyString(userInfo.sub)) {
    throw new MeetException({
      message: 'Google did not return the id of the connected account',
      code: 'ACCOUNT_NOT_IDENTIFIED',
    });
  }

  return {
    externalAccountId: userInfo.sub,
    ...(isNonEmptyString(userInfo.email) ? { handle: userInfo.email } : {}),
  };
};

export default defineLogicFunction({
  universalIdentifier: MEET_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'meet-identify-account',
  description:
    'Returns the Google account id behind a connection, so a reconnect cannot switch it to another Google account.',
  timeoutSeconds: 10,
  handler: meetIdentifyAccountHandler,
});
