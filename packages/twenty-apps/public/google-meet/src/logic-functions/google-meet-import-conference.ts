import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GoogleMeetConferenceSyncOutcome } from 'src/logic-functions/types/google-meet-conference-sync-outcome.type';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { syncGoogleMeetConferenceOrThrow } from 'src/logic-functions/utils/sync-google-meet-conference-or-throw.util';

type GoogleMeetImportConferenceResult =
  | { success: true; outcome: GoogleMeetConferenceSyncOutcome }
  | { success: false; error: string };

export const googleMeetImportConferenceHandler = async ({
  connectedAccountId,
  conferenceRecordName,
  startTime,
  endTime,
  spaceName,
}: {
  connectedAccountId?: string;
  conferenceRecordName?: string;
  startTime?: string;
  endTime?: string;
  spaceName?: string;
}): Promise<GoogleMeetImportConferenceResult> => {
  if (
    !isNonEmptyString(connectedAccountId) ||
    !isNonEmptyString(conferenceRecordName) ||
    !isNonEmptyString(startTime)
  ) {
    return {
      success: false,
      error: 'Invalid Google Meet conference import job',
    };
  }

  const outcome = await syncGoogleMeetConferenceOrThrow({
    accessToken: getConnectionAccessTokenOrThrow(
      await getConnection(connectedAccountId),
    ),
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    conferenceRecord: {
      name: conferenceRecordName,
      startTime,
      ...(isNonEmptyString(endTime) ? { endTime } : {}),
      ...(isNonEmptyString(spaceName) ? { space: spaceName } : {}),
    },
  });

  return { success: true, outcome };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-import-conference',
  description:
    'Imports the transcript and Gemini notes of one Google Meet conference into a Call Recording.',
  timeoutSeconds: 300,
  handler: googleMeetImportConferenceHandler,
});
