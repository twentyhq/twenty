import { Control, Controller } from 'react-hook-form';

import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ConnectionParameters } from '~/generated/graphql';

const StyledFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type SetttingsAccountsImapConnectionFormProps = {
  control: Control<ConnectionParameters & { handle: string }>;
  isEditing: boolean;
  defaultValues?: Partial<ConnectionParameters & { handle: string }>;
};

export const SetttingsAccountsImapConnectionForm = ({
  control,
  isEditing,
  defaultValues,
}: SetttingsAccountsImapConnectionFormProps) => {
  const { t } = useLingui();

  return (
    <Section>
      <H2Title
        title={t`IMAP Connection Details`}
        description={
          isEditing
            ? t`Update your IMAP email account configuration`
            : t`Configure your IMAP email account`
        }
      />
      <StyledFormContainer>
        <Controller
          name="handle"
          control={control}
          defaultValue={defaultValues?.handle}
          render={({ field, fieldState }) => (
            <TextInput
              instanceId="email-address-imap-connection-form"
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
          defaultValue={defaultValues?.host}
          render={({ field, fieldState }) => (
            <TextInput
              instanceId="host-imap-connection-form"
              label={t`IMAP Server`}
              placeholder={t`imap.example.com`}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="port"
          control={control}
          defaultValue={defaultValues?.port ?? 993}
          render={({ field, fieldState }) => (
            <TextInput
              instanceId="port-imap-connection-form"
              label={t`IMAP Port`}
              type="number"
              placeholder={t`993`}
              value={field.value.toString()}
              onChange={(value) => field.onChange(Number(value))}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="secure"
          control={control}
          defaultValue={defaultValues?.secure}
          render={({ field }) => (
            <Select
              label={t`Encryption`}
              options={[
                { label: 'SSL/TLS', value: true },
                { label: 'None', value: false },
              ]}
              value={field.value}
              onChange={field.onChange}
              dropdownId="secure-dropdown"
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue={defaultValues?.password}
          render={({ field, fieldState }) => (
            <TextInput
              instanceId="password-imap-connection-form"
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
