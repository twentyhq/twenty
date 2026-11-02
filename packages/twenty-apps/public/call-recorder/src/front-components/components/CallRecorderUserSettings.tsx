import 'twenty-ui/style.css';

import { useState } from 'react';
import { Section } from 'twenty-ui/components/layout';

import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { CALL_RECORDER_RECORD_MY_MEETINGS_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';

export const CallRecorderUserSettings = () => {
  const [isRecordingMyMeetings, setIsRecordingMyMeetings] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_RECORD_MY_MEETINGS_ROW.variableKey,
      ) !== 'false',
  );

  const { saveImmediately } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_RECORD_MY_MEETINGS_ROW.variableKey,
    scope: 'USER',
    onSaveSuccess: () => requestCalendarBotSchedulingSync(),
    onSaveError: (value) => setIsRecordingMyMeetings(value !== 'true'),
  });

  const handleChange = (checked: boolean) => {
    setIsRecordingMyMeetings(checked);
    saveImmediately(checked ? 'true' : 'false');
  };

  return (
    <FrontComponentThemeProvider>
      <Section.Root>
        <StyledSettingsCard>
          <SettingsOptionCardContentToggle
            Icon={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.Icon}
            title={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.title}
            description={CALL_RECORDER_RECORD_MY_MEETINGS_ROW.description}
            checked={isRecordingMyMeetings}
            onChange={handleChange}
          />
        </StyledSettingsCard>
      </Section.Root>
    </FrontComponentThemeProvider>
  );
};
