import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsSecurityAddWebsiteFormProps = {
  instanceId: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SettingsSecurityAddWebsiteForm = ({
  instanceId,
  placeholder,
  value,
  disabled,
  error,
  onChange,
  onSubmit,
}: SettingsSecurityAddWebsiteFormProps) => {
  const { t } = useLingui();

  return (
    <StyledForm>
      <StyledInputContainer>
        <SettingsTextInput
          instanceId={instanceId}
          aria-label={t`Website origin`}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onInputEnter={onSubmit}
          error={error}
          fullWidth
        />
      </StyledInputContainer>
      <Button
        disabled={disabled || !isNonEmptyString(value.trim())}
        onClick={onSubmit}
      >
        {t`Add website`}
      </Button>
    </StyledForm>
  );
};
