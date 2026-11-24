import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { requestMemberRecordingPreferenceSync } from 'src/front-components/utils/request-member-recording-preference-sync.util';
import { CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-member-recording-preference-env-var-name';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const useSaveMemberRecordingPreference = () => {
  const { t } = useTranslate();

  const saveMemberRecordingPreference = async (
    memberRecordingPreference: MemberRecordingPreference,
  ): Promise<boolean> => {
    try {
      await new MetadataApiClient().mutation({
        updateMyUserApplicationVariable: {
          __args: {
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            key: CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME,
            value: memberRecordingPreference,
          },
        },
      });
    } catch {
      await enqueueSnackbar({
        message: t('Could not save your choice.'),
        variant: 'error',
      });

      return false;
    }

    await requestMemberRecordingPreferenceSync();

    return true;
  };

  return { saveMemberRecordingPreference };
};
