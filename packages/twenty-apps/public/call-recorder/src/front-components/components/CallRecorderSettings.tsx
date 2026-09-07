import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { useState } from 'react';
import {
  useColorScheme,
  useFrontComponentId,
} from 'twenty-sdk/front-component';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';

import { InCallSection } from 'src/front-components/components/InCallSection';
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
  const colorScheme = useColorScheme();
  const frontComponentId = useFrontComponentId();
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
      ) !== 'false',
  );

  // twenty-ui components read icon sizes off ThemeContext, and the context
  // default resolves them to var() strings an SVG size attribute cannot use —
  // menu check marks render at their intrinsic size without a real theme here.
  return (
    <ThemeContext.Provider
      value={{
        theme: (colorScheme === 'dark'
          ? THEME_DARK
          : THEME_LIGHT) as unknown as ThemeType,
        colorScheme,
      }}
    >
      <StyledContainer>
        <SchedulingSection
          frontComponentId={frontComponentId}
          isEnabled={isSchedulingEnabled}
          onEnabledChange={setIsSchedulingEnabled}
        />
        {isSchedulingEnabled ? (
          <>
            <RecorderSection frontComponentId={frontComponentId} />
            <InCallSection frontComponentId={frontComponentId} />
            <TranscriptionSection frontComponentId={frontComponentId} />
          </>
        ) : (
          <StyledPausedNotice>
            Recording is paused. Turn it back on to schedule recorders and edit
            how they behave. Your settings are kept.
          </StyledPausedNotice>
        )}
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
