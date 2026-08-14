import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

import { ApplicationVariableLabelRow } from 'src/front-components/components/ApplicationVariableLabelRow';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';
import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';

const APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS = 250;
const APPLICATION_VARIABLE_REVEAL_ICON_SIZE = 16;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  position: relative;
`;

const StyledRevealButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  bottom: 0;
  color: ${() => themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin: auto 0;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  position: absolute;
  right: 0;
  top: 0;

  &:hover {
    color: ${() => themeCssVariables.font.color.secondary};
  }
`;

type ApplicationVariableRowProps = {
  variable: FirefliesApplicationVariable;
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
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);

  const { updateApplicationVariable } =
    useUpdateApplicationVariable(applicationId);

  // A stored secret reads back masked, so the field starts empty and shows the
  // mask as a placeholder rather than echoing it back as an editable value.
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
    }
  }, APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS);

  return (
    <StyledRow>
      <ApplicationVariableLabelRow
        variableKey={variable.key}
        description={variable.description}
        isDeprecated={variable.isDeprecated}
        inputId={inputId}
        tooltipId={`application-variable-description-${variable.key}`}
      />
      <StyledInputContainer>
        <StyledSettingsTextInput
          id={inputId}
          type={variable.isSecret && !isSecretRevealed ? 'password' : 'text'}
          data-has-trailing-icon={variable.isSecret ? 'true' : undefined}
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
        {variable.isSecret && (
          <StyledRevealButton
            type="button"
            tabIndex={-1}
            aria-label={
              isSecretRevealed ? `Hide ${variable.key}` : `Show ${variable.key}`
            }
            onClick={() => setIsSecretRevealed(!isSecretRevealed)}
          >
            {isSecretRevealed ? (
              <IconEyeOff size={APPLICATION_VARIABLE_REVEAL_ICON_SIZE} />
            ) : (
              <IconEye size={APPLICATION_VARIABLE_REVEAL_ICON_SIZE} />
            )}
          </StyledRevealButton>
        )}
      </StyledInputContainer>
    </StyledRow>
  );
};
