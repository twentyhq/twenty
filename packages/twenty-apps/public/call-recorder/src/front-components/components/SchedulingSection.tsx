import { Section } from 'twenty-ui/components/layout';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsOptionCardContentSwitch } from 'src/front-components/components/SettingsOptionCardContentSwitch';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';

type SchedulingSectionProps = {
  isEnabled: boolean;
  onEnabledChange: (isEnabled: boolean) => void;
};

export const SchedulingSection = ({
  isEnabled,
  onEnabledChange,
}: SchedulingSectionProps) => {
  const { saveImmediately } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
    onSaveSuccess: () => requestCalendarBotSchedulingSync(),
    onSaveError: (value) => onEnabledChange(value !== 'true'),
  });

  const handleChange = (checked: boolean) => {
    onEnabledChange(checked);
    saveImmediately(checked ? 'true' : 'false');
  };

  return (
    <Section.Root>
      <Card.Root fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.Icon}
          title={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.title}
          description={CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.description}
          checked={isEnabled}
          onChange={handleChange}
        />
      </Card.Root>
    </Section.Root>
  );
};
