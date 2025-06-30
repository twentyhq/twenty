import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Control, Controller } from 'react-hook-form';

import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const DEFAULT_IMAP_PORT = 993;
const DEFAULT_SMTP_PORT = 587;

type ConnectionType = 'IMAP' | 'SMTP';

type ConnectionFormData = {
  handle: string;
  host: string;
  port: number;
  password: string;
  secure: boolean;
};

type SettingsAccountsConnectionFormProps = {
  control: Control<ConnectionFormData>;
  connectionType: ConnectionType;
  isEditing: boolean;
};

export const SettingsAccountsConnectionForm = ({
  control,
  connectionType,
  isEditing,
}: SettingsAccountsConnectionFormProps) => {
  const { t } = useLingui();

  const getTitle = () => {
    return connectionType === 'IMAP'
      ? t`IMAP Connection Details`
      : t`SMTP Connection Details`;
  };

  const getDescription = () => {
    if (isEditing) {
      return connectionType === 'IMAP'
        ? t`Update your IMAP email account configuration`
        : t`Update your SMTP email account configuration`;
    }
    return connectionType === 'IMAP'
      ? t`Configure your IMAP email account`
      : t`Configure your SMTP email account for sending emails`;
  };

  const getServerLabel = () => {
    return connectionType === 'IMAP' ? t`IMAP Server` : t`SMTP Server`;
  };

  const getServerPlaceholder = () => {
    return connectionType === 'IMAP'
      ? t`imap.example.com`
      : t`smtp.example.com`;
  };

  const getPortLabel = () => {
    return connectionType === 'IMAP' ? t`IMAP Port` : t`SMTP Port`;
  };

  const getPortPlaceholder = () => {
    return connectionType === 'IMAP'
      ? t`${DEFAULT_IMAP_PORT}`
      : t`${DEFAULT_SMTP_PORT}`;
  };

  const getEncryptionOptions = () => {
    if (connectionType === 'IMAP') {
      return [
        { label: 'SSL/TLS', value: true },
        { label: 'None', value: false },
      ];
    }
    return [
      { label: 'SSL/TLS', value: true },
      { label: 'STARTTLS', value: false },
    ];
  };

  return (
    <Section>
      <H2Title title={getTitle()} description={getDescription()} />
      <StyledFormContainer>
        <Controller
          name="handle"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label={t`Email Address`}
              placeholder={t`john.doe@example.com`}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="host"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label={getServerLabel()}
              placeholder={getServerPlaceholder()}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="port"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label={getPortLabel()}
              type="number"
              placeholder={getPortPlaceholder()}
              value={field.value.toString()}
              onChange={(value) => field.onChange(Number(value))}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="secure"
          control={control}
          render={({ field }) => (
            <Select
              label={t`Encryption`}
              options={getEncryptionOptions()}
              value={field.value}
              onChange={field.onChange}
              dropdownId="secure-dropdown"
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label={t`Password`}
              placeholder={t`••••••••`}
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </StyledFormContainer>
    </Section>
  );
};
