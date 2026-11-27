import { CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-member-recording-preference-env-var-name';
import { UNREADABLE_MEMBER_RECORDING_PREFERENCE } from 'src/logic-functions/constants/unreadable-member-recording-preference';
import { fetchMemberApplicationVariables } from 'src/logic-functions/data/fetch-member-application-variables.util';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';
import { isMemberRecordingPreference } from 'src/logic-functions/utils/is-member-recording-preference.util';

export const fetchMemberRecordingPreferenceByUserWorkspaceId =
  async (): Promise<Map<string, MemberRecordingPreference>> => {
    const memberApplicationVariables = await fetchMemberApplicationVariables();
    const memberRecordingPreferenceByUserWorkspaceId = new Map<
      string,
      MemberRecordingPreference
    >();

    for (const { userWorkspaceId, variables } of memberApplicationVariables) {
      const savedValue = variables.find(
        ({ key }) =>
          key === CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME,
      )?.value;

      // The server saves any text for a select variable, options are not enforced.
      memberRecordingPreferenceByUserWorkspaceId.set(
        userWorkspaceId,
        isMemberRecordingPreference(savedValue)
          ? savedValue
          : UNREADABLE_MEMBER_RECORDING_PREFERENCE,
      );
    }

    return memberRecordingPreferenceByUserWorkspaceId;
  };
