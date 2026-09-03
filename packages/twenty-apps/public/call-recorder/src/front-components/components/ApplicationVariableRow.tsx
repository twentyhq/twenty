import styled from '@emotion/styled';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useId, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ApplicationVariableInput } from 'src/front-components/components/ApplicationVariableInput';
import { ApplicationVariableLabelRow } from 'src/front-components/components/ApplicationVariableLabelRow';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

const SAVED_SECRET_VALUE_PLACEHOLDER = '********';

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDescription = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

type ApplicationVariableRowProps = {
  applicationId: string | undefined;
  variable: CallRecorderApplicationVariable;
};

export const ApplicationVariableRow = ({
  applicationId,
  variable,
}: ApplicationVariableRowProps) => {
  const inputId = useId();

  const [isSecretStored, setIsSecretStored] = useState(
    variable.isSecret && isNonEmptyString(variable.value),
  );
  const [inputValue, setInputValue] = useState(
    isSecretStored ? '' : variable.value,
  );
  const { saveDebounced, saveImmediately } = useAutosaveApplicationVariable({
    applicationId,
    variableKey: variable.key,
    onSaveSuccess: (savedValue) => {
      if (!variable.isSecret) {
        return;
      }

      setIsSecretStored(isNonEmptyString(savedValue));
      setInputValue((currentInputValue) =>
        currentInputValue === savedValue ? '' : currentInputValue,
      );
    },
  });

  const isNumberVariable =
    variable.type === 'NUMBER' || variable.type === 'NUMERIC';
  const hasInvalidNumber =
    isNumberVariable && isUndefined(getNormalizedNumberValue(inputValue));

  const handleChange = (newValue: string) => {
    setInputValue(newValue);

    const valueToSave = isNumberVariable
      ? getNormalizedNumberValue(newValue)
      : newValue;

    if (isUndefined(valueToSave)) {
      saveDebounced.cancel();
      return;
    }

    if (variable.type === 'BOOLEAN' || variable.type === 'SELECT') {
      saveImmediately(valueToSave);
      return;
    }

    saveDebounced(valueToSave);
  };

  return (
    <StyledRow>
      <ApplicationVariableLabelRow
        variableKey={variable.key}
        label={variable.label}
        isDeprecated={variable.isDeprecated}
        inputId={inputId}
      />
      {isNonEmptyString(variable.description) && (
        <StyledDescription>{variable.description}</StyledDescription>
      )}
      <ApplicationVariableInput
        inputId={inputId}
        variable={variable}
        value={inputValue}
        placeholder={
          isSecretStored ? SAVED_SECRET_VALUE_PLACEHOLDER : undefined
        }
        onChange={handleChange}
        onBlur={() => saveDebounced.flush()}
      />
      {hasInvalidNumber && (
        <StyledSettingsError>Invalid number</StyledSettingsError>
      )}
    </StyledRow>
  );
};
