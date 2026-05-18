import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Control, Controller } from 'react-hook-form';

import { type AccountType } from 'twenty-shared/constants';

import { type ConnectionFormData } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPasswordFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledEditPasswordLink = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const MASKED_PASSWORD_PLACEHOLDER = '••••••••';

type SettingsAccountsPasswordControllerProps = {
  protocol: AccountType;
  control: Control<ConnectionFormData>;
  disabled: boolean;
  onUnlock: () => void;
};

export const SettingsAccountsPasswordController = ({
  protocol,
  control,
  disabled,
  onUnlock,
}: SettingsAccountsPasswordControllerProps) => {
  const { t } = useLingui();

  return (
    <Controller
      name={`${protocol}.password`}
      control={control}
      render={({ field, fieldState }) => (
        <StyledPasswordFieldContainer>
          <SettingsTextInput
            instanceId={`${protocol.toLowerCase()}-password-connection-form`}
            label={t`${protocol} Password`}
            placeholder={disabled ? MASKED_PASSWORD_PLACEHOLDER : ''}
            type={disabled ? 'text' : 'password'}
            value={field.value || ''}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={disabled}
          />
          {disabled && (
            <StyledEditPasswordLink type="button" onClick={onUnlock}>
              {t`Change password`}
            </StyledEditPasswordLink>
          )}
        </StyledPasswordFieldContainer>
      )}
    />
  );
};
