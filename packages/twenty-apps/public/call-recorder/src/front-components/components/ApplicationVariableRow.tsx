import styled from '@emotion/styled';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ApplicationVariableInput } from 'src/front-components/components/ApplicationVariableInput';
import { ApplicationVariableLabelRow } from 'src/front-components/components/ApplicationVariableLabelRow';
import { useDebouncedSaveApplicationVariable } from 'src/front-components/hooks/use-debounced-save-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

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

  const { saveDebounced } = useDebouncedSaveApplicationVariable({
    applicationId,
    variableKey: variable.key,
  });

  const isSecretStored = variable.isSecret && isNonEmptyString(variable.value);
  const draftValue = value ?? (isSecretStored ? '' : variable.value);

  const isNumberVariable =
    variable.type === 'NUMBER' || variable.type === 'NUMERIC';
  const hasInvalidNumber =
    isNumberVariable && isUndefined(getNormalizedNumberValue(draftValue));

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
