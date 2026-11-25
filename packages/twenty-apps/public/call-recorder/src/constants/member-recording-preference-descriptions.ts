import { msg } from 'twenty-sdk/front-component';

import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const MEMBER_RECORDING_PREFERENCE_DESCRIPTIONS: Record<
  MemberRecordingPreference,
  ReturnType<typeof msg>
> = {
  ALL: msg('The recorder joins every meeting on your calendar.'),
  INTERNAL: msg(
    'The recorder joins meetings where everyone is from your company.',
  ),
  EXTERNAL: msg(
    'The recorder joins meetings with someone from outside your company.',
  ),
  NONE: msg(
    'The recorder only joins meetings you or a teammate chose to record.',
  ),
};
