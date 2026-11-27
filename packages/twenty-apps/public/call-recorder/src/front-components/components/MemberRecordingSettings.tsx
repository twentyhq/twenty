import 'twenty-ui/style.css';

import { useId, useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconVideo } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { MEMBER_RECORDING_PREFERENCE_DESCRIPTIONS } from 'src/constants/member-recording-preference-descriptions';
import { MEMBER_RECORDING_PREFERENCE_OPTIONS } from 'src/constants/member-recording-preference-options';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { MemberInboxRecapsSetting } from 'src/front-components/components/MemberInboxRecapsSetting';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { useIsInboxEnabled } from 'src/front-components/hooks/use-is-inbox-enabled';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';
import { CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-member-recording-preference-env-var-name';
import { DEFAULT_MEMBER_RECORDING_PREFERENCE } from 'src/logic-functions/constants/default-member-recording-preference';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';
import { isMemberRecordingPreference } from 'src/logic-functions/utils/is-member-recording-preference.util';

export const MemberRecordingSettings = () => {
  const { t } = useTranslate();
  const titleId = useId();
  const isInboxEnabled = useIsInboxEnabled();
  const [savedMemberRecordingPreference, setSavedMemberRecordingPreference] =
    useState<MemberRecordingPreference>(() => {
      const savedValue = getApplicationVariableValue(
        CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME,
      );

      return isMemberRecordingPreference(savedValue)
        ? savedValue
        : DEFAULT_MEMBER_RECORDING_PREFERENCE;
    });
  const [memberRecordingPreference, setMemberRecordingPreference] = useState(
    savedMemberRecordingPreference,
  );
  const { saveImmediately } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_MEMBER_RECORDING_PREFERENCE_ENV_VAR_NAME,
    scope: 'USER',
    onSaveSuccess: (savedValue) => {
      if (isMemberRecordingPreference(savedValue)) {
        setSavedMemberRecordingPreference(savedValue);
      }

      return requestCalendarBotSchedulingSync();
    },
    onSaveError: () =>
      setMemberRecordingPreference(savedMemberRecordingPreference),
  });

  const options = MEMBER_RECORDING_PREFERENCE_OPTIONS.map(
    ({ label, value }) => ({ label: t(label), value }),
  );

  const handleChange = (nextValue: string) => {
    if (!isMemberRecordingPreference(nextValue)) {
      return;
    }

    setMemberRecordingPreference(nextValue);
    saveImmediately(nextValue);
  };

  return (
    <FrontComponentThemeProvider>
      <StyledSettingsSectionStack>
        <Section.Root>
          <Card.Root fullWidth>
            <SettingsOptionCardContentSelect
              Icon={IconVideo}
              title={t('Meetings to record')}
              titleId={titleId}
              description={t(
                MEMBER_RECORDING_PREFERENCE_DESCRIPTIONS[
                  memberRecordingPreference
                ],
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
        {isInboxEnabled && <MemberInboxRecapsSetting />}
      </StyledSettingsSectionStack>
    </FrontComponentThemeProvider>
  );
};
