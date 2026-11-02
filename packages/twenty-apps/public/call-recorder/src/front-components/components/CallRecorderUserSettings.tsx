import 'twenty-ui/style.css';

import { useState } from 'react';
import { Section } from 'twenty-ui/components/layout';

import { CALL_RECORDER_RECORD_MY_MEETINGS_OPTIONS } from 'src/constants/call-recorder-record-my-meetings-options';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionSelect } from 'src/front-components/components/SettingsOptionSelect';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { CALL_RECORDER_RECORD_MY_MEETINGS_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';
import { DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS } from 'src/logic-functions/constants/default-call-recorder-record-my-meetings';

export const CallRecorderUserSettings = () => {
  const [recordMyMeetingsValue, setRecordMyMeetingsValue] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_RECORD_MY_MEETINGS_ROW.variableKey,
      ) || DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS,
  );

  const { saveImmediately } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_RECORD_MY_MEETINGS_ROW.variableKey,
    scope: 'USER',
    onSaveSuccess: () => requestCalendarBotSchedulingSync(),
  });

  const handleChange = (value: string) => {
    setRecordMyMeetingsValue(value);
    saveImmediately(value);
  };

  return (
    <FrontComponentThemeProvider>
      <Section.Root>
        <StyledSettingsCard>
          <SettingsOptionCardContentSelect
            Icon={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.Icon}
            title={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.title}
            description={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.description}
          >
            <SettingsOptionSelect
              value={recordMyMeetingsValue}
              options={CALL_RECORDER_RECORD_MY_MEETINGS_OPTIONS}
              ariaLabel={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.title}
              listboxId="call-recorder-record-my-meetings"
              onChange={handleChange}
            />
          </SettingsOptionCardContentSelect>
        </StyledSettingsCard>
      </Section.Root>
    </FrontComponentThemeProvider>
  );
};
