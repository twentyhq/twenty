import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { type Control, Controller } from 'react-hook-form';

import { type AccountType } from 'twenty-shared/constants';

import { type ConnectionFormData } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ClickToActionLink } from 'twenty-ui-deprecated/navigation';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledPasswordFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledChangePasswordLink = styled(ClickToActionLink)`
  align-self: flex-end;
`;

const MASKED_PASSWORD_PLACEHOLDER = '••••••••';

type SettingsAccountsPasswordControllerProps = {
  protocol: AccountType;
  label: string;
  control: Control<ConnectionFormData>;
  disabled: boolean;
  onUnlock: () => void;
};

export const SettingsAccountsPasswordController = ({
  protocol,
  label,
  control,
  disabled,
  onUnlock,
}: SettingsAccountsPasswordControllerProps) => {
  return (
    <Controller
      name={`${protocol}.password`}
      control={control}
      render={({ field, fieldState }) => (
        <StyledPasswordFieldContainer>
          <SettingsTextInput
            instanceId={`${protocol.toLowerCase()}-password-connection-form`}
            label={label}
            placeholder={disabled ? MASKED_PASSWORD_PLACEHOLDER : ''}
            type={disabled ? 'text' : 'password'}
            value={field.value || ''}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={disabled}
          />
          {disabled && (
            <StyledChangePasswordLink onClick={onUnlock}>
              <Trans>Change password</Trans>
            </StyledChangePasswordLink>
          )}
        </StyledPasswordFieldContainer>
      )}
    />
  );
};
