import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { InCallSection } from 'src/front-components/components/InCallSection';
import { RecordPagesSection } from 'src/front-components/components/RecordPagesSection';
import { RecorderSection } from 'src/front-components/components/RecorderSection';
import { SchedulingSection } from 'src/front-components/components/SchedulingSection';
import { TranscriptionSection } from 'src/front-components/components/TranscriptionSection';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledPausedNotice = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.md};
  line-height: ${() => themeCssVariables.text.lineHeight.md};
`;

export const CallRecorderSettings = () => {
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
      ) !== 'false',
  );

  return (
    <FrontComponentThemeProvider>
      <StyledContainer>
        <SchedulingSection
          isEnabled={isSchedulingEnabled}
          onEnabledChange={setIsSchedulingEnabled}
        />
        {isSchedulingEnabled ? (
          <>
            <RecorderSection />
            <InCallSection />
            <TranscriptionSection />
          </>
        ) : (
          <StyledPausedNotice>
            Recording is paused. Turn it back on to schedule recorders and edit
            how they behave. Your settings are kept.
          </StyledPausedNotice>
        )}
        <RecordPagesSection />
      </StyledContainer>
    </FrontComponentThemeProvider>
  );
};
