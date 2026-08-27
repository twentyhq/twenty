import styled from '@emotion/styled';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useId } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

import { ApplicationVariableInput } from 'src/front-components/components/ApplicationVariableInput';
import { ApplicationVariableLabelRow } from 'src/front-components/components/ApplicationVariableLabelRow';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

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

const StyledError = styled.span`
  color: ${() => themeCssVariables.font.color.danger};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-top: ${() => themeCssVariables.spacing[1]};
`;

type ApplicationVariableRowProps = {
  variable: CallRecorderApplicationVariable;
  applicationId: string;
  value: string | undefined;
  onValueChange: (params: { variableKey: string; value: string }) => void;
};

export const ApplicationVariableRow = ({
  variable,
  applicationId,
  value,
  onValueChange,
}: ApplicationVariableRowProps) => {
  const inputId = useId();

  const { updateApplicationVariable } =
    useUpdateApplicationVariable(applicationId);

  const isSecretStored = variable.isSecret && isNonEmptyString(variable.value);
  const draftValue = value ?? (isSecretStored ? '' : variable.value);

  const isNumberVariable =
    variable.type === 'NUMBER' || variable.type === 'NUMERIC';
  const hasInvalidNumber =
    isNumberVariable && isUndefined(getNormalizedNumberValue(draftValue));

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

  const handleChange = (newValue: string) => {
    onValueChange({ variableKey: variable.key, value: newValue });

    const valueToSave = isNumberVariable
      ? getNormalizedNumberValue(newValue)
      : newValue;

    if (isUndefined(valueToSave)) {
      saveDebounced.cancel();
      return;
    }

    saveDebounced(valueToSave);
  };

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
      <ApplicationVariableInput
        inputId={inputId}
        variable={variable}
        value={draftValue}
        placeholder={isSecretStored ? variable.value : undefined}
        onChange={handleChange}
        onBlur={() => saveDebounced.flush()}
      />
      {hasInvalidNumber && <StyledError>Invalid number</StyledError>}
    </StyledRow>
  );
};
