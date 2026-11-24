import 'twenty-ui/style.css';

import { useId, useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconVideo } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { useSaveMemberRecordingPreference } from 'src/front-components/hooks/use-save-member-recording-preference';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-member-recording-preference-env-var-name';
import { DEFAULT_MEMBER_RECORDING_PREFERENCE } from 'src/logic-functions/constants/default-member-recording-preference';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';
import { isMemberRecordingPreference } from 'src/logic-functions/utils/is-member-recording-preference.util';

export const MemberRecordingSettings = () => {
  const { t } = useTranslate();
  const titleId = useId();
  const { saveMemberRecordingPreference } = useSaveMemberRecordingPreference();
  const [memberRecordingPreference, setMemberRecordingPreference] =
    useState<MemberRecordingPreference>(() => {
      const savedValue = getApplicationVariableValue(
        CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME,
      );

      return isMemberRecordingPreference(savedValue)
        ? savedValue
        : DEFAULT_MEMBER_RECORDING_PREFERENCE;
    });

  const options: { label: string; value: MemberRecordingPreference }[] = [
    { label: t('All'), value: 'ALL' },
    { label: t('Internal'), value: 'INTERNAL' },
    { label: t('External'), value: 'EXTERNAL' },
    { label: t('None'), value: 'NONE' },
  ];

  const handleChange = async (nextValue: string) => {
    if (!isMemberRecordingPreference(nextValue)) {
      return;
    }

    const previousMemberRecordingPreference = memberRecordingPreference;

    setMemberRecordingPreference(nextValue);

    const isSaved = await saveMemberRecordingPreference(nextValue);

    if (!isSaved) {
      setMemberRecordingPreference(previousMemberRecordingPreference);
    }
  };

  return (
    <FrontComponentThemeProvider>
      <Section.Root>
        <Card.Root fullWidth>
          <SettingsOptionCardContentSelect
            Icon={IconVideo}
            title={t('Meetings to record')}
            titleId={titleId}
            description={t(
              'Which of your meetings the recorder joins on its own.',
            )}
          >
            <SettingsSelectControl
              value={memberRecordingPreference}
              options={options}
              labelledBy={titleId}
              onChange={handleChange}
            />
          </SettingsOptionCardContentSelect>
        </Card.Root>
      </Section.Root>
    </FrontComponentThemeProvider>
  );
};
