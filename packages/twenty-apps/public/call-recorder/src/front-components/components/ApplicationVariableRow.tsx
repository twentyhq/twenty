import styled from '@emotion/styled';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ApplicationVariableInput } from 'src/front-components/components/ApplicationVariableInput';
import { ApplicationVariableLabelRow } from 'src/front-components/components/ApplicationVariableLabelRow';
import {
  type ApplicationVariableDraft,
  type UpdateApplicationVariableDraft,
} from 'src/front-components/types/application-variable-draft.type';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

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

const StyledError = styled.span`
  color: ${() => themeCssVariables.font.color.danger};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-top: ${() => themeCssVariables.spacing[1]};
`;

type ApplicationVariableRowProps = {
  variable: CallRecorderApplicationVariable;
  draftValue: ApplicationVariableDraft | undefined;
  onDraftValueChange: UpdateApplicationVariableDraft;
};

export const ApplicationVariableRow = ({
  variable,
  draftValue,
  onDraftValueChange,
}: ApplicationVariableRowProps) => {
  const inputId = useId();

  const isSecretStored = variable.isSecret && isNonEmptyString(variable.value);
  const inputValue =
    draftValue?.inputValue ?? (isSecretStored ? '' : variable.value);

  const isNumberVariable =
    variable.type === 'NUMBER' || variable.type === 'NUMERIC';
  const hasInvalidNumber =
    isNumberVariable && isUndefined(getNormalizedNumberValue(inputValue));

  const handleChange = (newValue: string) => {
    onDraftValueChange({
      variableKey: variable.key,
      inputValue: newValue,
      valueToSave: isNumberVariable
        ? getNormalizedNumberValue(newValue)
        : newValue,
    });
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
        value={inputValue}
        placeholder={isSecretStored ? variable.value : undefined}
        onChange={handleChange}
      />
      {hasInvalidNumber && <StyledError>Invalid number</StyledError>}
    </StyledRow>
  );
};
