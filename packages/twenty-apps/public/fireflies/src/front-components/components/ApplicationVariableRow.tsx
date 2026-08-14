import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

import { ApplicationVariableLabelRow } from 'src/front-components/components/ApplicationVariableLabelRow';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';
import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';

const APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS = 250;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDescription = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

type ApplicationVariableRowProps = {
  variable: FirefliesApplicationVariable;
  applicationId: string;
  value: string | undefined;
  onValueChange: (params: { variableKey: string; value: string }) => void;
  onValueSaved: (params: { variableKey: string; value: string }) => void;
};

export const ApplicationVariableRow = ({
  variable,
  applicationId,
  value,
  onValueChange,
  onValueSaved,
}: ApplicationVariableRowProps) => {
  const inputId = useId();

  const { updateApplicationVariable } =
    useUpdateApplicationVariable(applicationId);

  const isSecretStored = variable.isSecret && isNonEmptyString(variable.value);
  const draftValue = value ?? (isSecretStored ? '' : variable.value);

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
      return;
    }

    onValueSaved({ variableKey: variable.key, value: newValue });
  }, APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS);

  return (
    <StyledRow>
      <ApplicationVariableLabelRow
        variableKey={variable.key}
        isDeprecated={variable.isDeprecated}
        inputId={inputId}
      />
      {isNonEmptyString(variable.description) && (
        <StyledDescription>{variable.description}</StyledDescription>
      )}
      <StyledSettingsTextInput
        id={inputId}
        type={variable.isSecret ? 'password' : 'text'}
        autoComplete="off"
        placeholder={isSecretStored ? variable.value : 'Value'}
        value={draftValue}
        onChange={(event) => {
          onValueChange({
            variableKey: variable.key,
            value: event.target.value,
          });
          saveDebounced(event.target.value);
        }}
        onBlur={() => saveDebounced.flush()}
      />
    </StyledRow>
  );
};
