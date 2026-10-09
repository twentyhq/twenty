import { useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { isShowUnmatchedAttendeesEnabled } from 'src/front-components/utils/is-show-unmatched-attendees-enabled.util';

export const RecordPagesSection = () => {
  const [isShowUnmatchedAttendees, setIsShowUnmatchedAttendees] = useState(
    isShowUnmatchedAttendeesEnabled,
  );

  const { saveImmediately } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ROW.variableKey,
    onSaveError: (value) => setIsShowUnmatchedAttendees(value !== 'true'),
  });

  const handleShowUnmatchedAttendeesChange = (checked: boolean) => {
    setIsShowUnmatchedAttendees(checked);
    saveImmediately(checked ? 'true' : 'false');
  };

  return (
    <Section>
      <H2Title
        title="Record pages"
        description="What the call widgets show on people, companies, opportunities and recordings."
      />
      <StyledSettingsCard>
        <SettingsOptionCardContentToggle
          Icon={CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ROW.Icon}
          title={CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ROW.title}
          description={CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ROW.description}
          checked={isShowUnmatchedAttendees}
          onChange={handleShowUnmatchedAttendeesChange}
        />
      </StyledSettingsCard>
    </Section>
  );
};
