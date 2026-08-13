import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FIREFLIES_API_KEY_VARIABLE_KEY } from 'src/constants/fireflies-api-key-variable-key.constant';
import { ApplicationVariableRow } from 'src/front-components/components/ApplicationVariableRow';
import { FirefliesBackfillSection } from 'src/front-components/components/FirefliesBackfillSection';
import { useFirefliesApplicationVariables } from 'src/front-components/hooks/use-fireflies-application-variables';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  padding: ${() => themeCssVariables.spacing[4]} 0;
  width: 100%;
`;

const StyledVariablesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
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

export const FirefliesSettings = () => {
  const {
    applicationId,
    applicationVariables,
    isApplicationVariablesQueryLoading,
    errorMessage,
  } = useFirefliesApplicationVariables();

  const [isApiKeyConfiguredOverride, setIsApiKeyConfiguredOverride] = useState<
    boolean | undefined
  >(undefined);

  const isApiKeyConfigured =
    isApiKeyConfiguredOverride ??
    isNonEmptyString(
      applicationVariables.find(
        (variable) => variable.key === FIREFLIES_API_KEY_VARIABLE_KEY,
      )?.value,
    );

  if (isApplicationVariablesQueryLoading) {
    return <StyledCenteredState>Loading settings…</StyledCenteredState>;
  }

  if (isUndefined(applicationId)) {
    return (
      <StyledCenteredState>
        {errorMessage ?? 'Please try again later.'}
      </StyledCenteredState>
    );
  }

  return (
    <StyledContainer>
      <StyledSection>
        <H2Title
          title="Configuration"
          description="Set your application configuration variables"
        />
        <StyledVariablesList>
          {applicationVariables.map((variable) => (
            <ApplicationVariableRow
              key={variable.key}
              applicationId={applicationId}
              variable={variable}
              onVariableSaved={({ variableKey, value }) => {
                if (variableKey === FIREFLIES_API_KEY_VARIABLE_KEY) {
                  setIsApiKeyConfiguredOverride(isNonEmptyString(value));
                }
              }}
            />
          ))}
        </StyledVariablesList>
      </StyledSection>
      <FirefliesBackfillSection isApiKeyConfigured={isApiKeyConfigured} />
    </StyledContainer>
  );
};
