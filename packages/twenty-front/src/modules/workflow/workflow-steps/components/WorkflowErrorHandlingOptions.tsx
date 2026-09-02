import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { theme } from 'twenty-ui/theme';
import { Toggle } from 'twenty-ui/input';

import { InputLabel } from '@/ui/input/components/InputLabel';

import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type ErrorHandlingOptionsValue = {
  retryOnFailure: { value: boolean };
  continueOnFailure: { value: boolean };
};

export type WorkflowErrorHandlingOptionsProps = {
  errorHandlingOptions?: ErrorHandlingOptionsValue;
  onChange: (options: ErrorHandlingOptionsValue) => void;
  readonly?: boolean;
};

export const WorkflowErrorHandlingOptions = ({
  errorHandlingOptions,
  onChange,
  readonly = false,
}: WorkflowErrorHandlingOptionsProps) => {
  const { t } = useLingui();

  const retryOnFailure = errorHandlingOptions?.retryOnFailure?.value ?? false;
  const continueOnFailure = errorHandlingOptions?.continueOnFailure?.value ?? false;

  const handleRetryChange = (value: boolean) => {
    onChange({
      retryOnFailure: { value },
      continueOnFailure: { value: continueOnFailure },
    });
  };

  const handleContinueChange = (value: boolean) => {
    onChange({
      retryOnFailure: { value: retryOnFailure },
      continueOnFailure: { value },
    });
  };

  return (
    <StyledContainer>
      <InputLabel>{t`Error handling`}</InputLabel>
      <StyledRow>
        <Toggle
          value={retryOnFailure}
          onChange={handleRetryChange}
          disabled={readonly}
          toggleSize="small"
          color={theme.color.blue}
        />
        <StyledLabel>{t`Retry on failure`}</StyledLabel>
      </StyledRow>
      <StyledRow>
        <Toggle
          value={continueOnFailure}
          onChange={handleContinueChange}
          disabled={readonly}
          toggleSize="small"
          color={theme.color.blue}
        />
        <StyledLabel>{t`Continue on failure`}</StyledLabel>
      </StyledRow>
    </StyledContainer>
  );
};
