import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';

// The field defaults to ON so upcoming meetings read as recorded; once the
// meeting has ended that default no longer describes anything and is cleared
// unless the recorder actually attempted the meeting.
export const isStaleDefaultCallRecorderPreference = ({
  callRecorderPreference,
  startsAt,
  endsAt,
  now,
}: {
  callRecorderPreference: string | undefined;
  startsAt: string | undefined;
  endsAt: string | undefined;
  now: Date;
}): boolean =>
  callRecorderPreference === CallRecorderPreference.ON &&
  hasMeetingEnded({ startsAt, endsAt, now });
