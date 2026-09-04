import { useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';

type SchedulingSectionProps = {
  frontComponentId: string;
};

export const SchedulingSection = ({
  frontComponentId,
}: SchedulingSectionProps) => {
  const [isCalendarBotSchedulingEnabled, setIsCalendarBotSchedulingEnabled] =
    useState(
      () =>
        getApplicationVariableValue(
          CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
        ) !== 'false',
    );

  const { saveImmediately: saveCalendarBotSchedulingImmediately } =
    useAutosaveApplicationVariable({
      frontComponentId,
      variableKey: CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
      onSaveSuccess: () => requestCalendarBotSchedulingSync(),
    });

  const handleCalendarBotSchedulingChange = (checked: boolean) => {
    setIsCalendarBotSchedulingEnabled(checked);
    saveCalendarBotSchedulingImmediately(checked ? 'true' : 'false');
  };

  return (
    <Section>
      <H2Title
        title="Scheduling"
        description="Which meetings the recorder joins."
      />
      <StyledSettingsSectionStack>
        <StyledSettingsCard>
          <SettingsOptionCardContentToggle
            Icon={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.Icon}
            title={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.title}
            description={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.description}
            checked={isCalendarBotSchedulingEnabled}
            onChange={handleCalendarBotSchedulingChange}
          />
        </StyledSettingsCard>
      </StyledSettingsSectionStack>
    </Section>
  );
};
