import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { ApplicationVariableRow } from 'src/front-components/components/ApplicationVariableRow';
import { useCallRecorderApplicationVariables } from 'src/front-components/hooks/use-call-recorder-application-variables';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledVariablesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
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

  const [draftValueByVariableKey, setDraftValueByVariableKey] = useState<
    Record<string, string>
  >({});

  if (isApplicationVariablesQueryLoading) {
    return <StyledCenteredState>Loading settings…</StyledCenteredState>;
  }

  if (isUndefined(applicationId)) {
    return <StyledCenteredState>{errorMessage}</StyledCenteredState>;
  }

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title="Configuration"
          description={
            applicationVariables.length > 0
              ? 'Set your application configuration variables'
              : 'No variables to set for this application'
          }
        />
        <StyledVariablesList>
          {applicationVariables.map((variable) => (
            <ApplicationVariableRow
              key={variable.key}
              variable={variable}
              applicationId={applicationId}
              value={draftValueByVariableKey[variable.key]}
              onValueChange={({ variableKey, value }) =>
                setDraftValueByVariableKey((previousDraftValues) => ({
                  ...previousDraftValues,
                  [variableKey]: value,
                }))
              }
            />
          ))}
        </StyledVariablesList>
      </Section>
    </StyledContainer>
  );
};
