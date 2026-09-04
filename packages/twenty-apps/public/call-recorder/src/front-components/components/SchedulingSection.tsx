import { Section } from 'twenty-ui/layout';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';

type SchedulingSectionProps = {
  frontComponentId: string;
  isEnabled: boolean;
  onEnabledChange: (isEnabled: boolean) => void;
};

export const SchedulingSection = ({
  frontComponentId,
  isEnabled,
  onEnabledChange,
}: SchedulingSectionProps) => {
  const { saveImmediately } = useAutosaveApplicationVariable({
    frontComponentId,
    variableKey: CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
    onSaveSuccess: () => requestCalendarBotSchedulingSync(),
    // A failed save would otherwise leave the tab hiding every setting while
    // the recorder is in fact still running.
    onSaveError: (value) => onEnabledChange(value !== 'true'),
  });

  const handleChange = (checked: boolean) => {
    onEnabledChange(checked);
    saveImmediately(checked ? 'true' : 'false');
  };

  return (
    <Section>
      <StyledSettingsCard>
        <SettingsOptionCardContentToggle
          Icon={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.Icon}
          title={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.title}
          description={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.description}
          checked={isEnabled}
          onChange={handleChange}
        />
      </StyledSettingsCard>
    </Section>
  );
};
