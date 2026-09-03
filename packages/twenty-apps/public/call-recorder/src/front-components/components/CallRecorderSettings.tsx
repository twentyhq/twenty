import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useColorScheme } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/layout';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { ApplicationVariableRow } from 'src/front-components/components/ApplicationVariableRow';
import { InCallSection } from 'src/front-components/components/InCallSection';
import { RecorderSection } from 'src/front-components/components/RecorderSection';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { TranscriptionSection } from 'src/front-components/components/TranscriptionSection';
import { CALL_RECORDER_MAPPED_VARIABLE_KEYS } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useCallRecorderApplicationVariables } from 'src/front-components/hooks/use-call-recorder-application-variables';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;

export const CallRecorderSettings = () => {
  const {
    applicationId,
    applicationVariables,
    isApplicationVariablesQueryLoading,
    errorMessage,
  } = useCallRecorderApplicationVariables();

  const colorScheme = useColorScheme();

  if (isApplicationVariablesQueryLoading) {
    return <StyledCenteredState>Loading settings…</StyledCenteredState>;
  }

  if (isUndefined(applicationId)) {
    return <StyledCenteredState>{errorMessage}</StyledCenteredState>;
  }

  const otherVariables = applicationVariables.filter(
    (variable) => !CALL_RECORDER_MAPPED_VARIABLE_KEYS.includes(variable.key),
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
        <InCallSection
          applicationId={applicationId}
          applicationVariables={applicationVariables}
        />
        <TranscriptionSection
          applicationId={applicationId}
          applicationVariables={applicationVariables}
        />
        <RecorderSection
          applicationId={applicationId}
          applicationVariables={applicationVariables}
        />
        {otherVariables.length > 0 && (
          <Section>
            <H2Title
              title="Other"
              description="Variables this app does not lay out explicitly."
            />
            <StyledSettingsSectionStack>
              {otherVariables.map((variable) => (
                <ApplicationVariableRow
                  key={variable.key}
                  applicationId={applicationId}
                  variable={variable}
                />
              ))}
            </StyledSettingsSectionStack>
          </Section>
        )}
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
