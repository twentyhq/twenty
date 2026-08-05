import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { useDebouncedCallback } from 'src/front-components/hooks/use-debounced-callback';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';
import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';

const APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS = 250;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${() => themeCssVariables.font.color.light};
  font-family: ${() => themeCssVariables.font.family};
  font-size: 11px;
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

const StyledDescription = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

type ApplicationVariableRowProps = {
  applicationId: string;
  variable: FirefliesApplicationVariable;
};

export const ApplicationVariableRow = ({
  applicationId,
  variable,
}: ApplicationVariableRowProps) => {
  const isSecretFilled = variable.isSecret && isNonEmptyString(variable.value);

  const [draftValue, setDraftValue] = useState(
    isSecretFilled ? '' : variable.value,
  );

  const { updateApplicationVariable } =
    useUpdateApplicationVariable(applicationId);

  const saveDebounced = useDebouncedCallback(async (newValue: string) => {
    const isUpdated = await updateApplicationVariable({
      variableKey: variable.key,
      value: newValue,
    });

    if (!isUpdated) {
      enqueueSnackbar({
        message: `Could not save ${variable.key}.`,
        variant: 'error',
      });
    }
  }, APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS);

  return (
    <StyledRow>
      <StyledLabelRow>
        <StyledLabel>{variable.key}</StyledLabel>
      </StyledLabelRow>
      {isNonEmptyString(variable.description) && (
        <StyledDescription>{variable.description}</StyledDescription>
      )}
      <StyledSettingsTextInput
        type={variable.isSecret ? 'password' : 'text'}
        autoComplete="off"
        placeholder={isSecretFilled ? variable.value : 'Value'}
        value={draftValue}
        onChange={(event) => {
          setDraftValue(event.target.value);
          saveDebounced(event.target.value);
        }}
      />
    </StyledRow>
  );
};
