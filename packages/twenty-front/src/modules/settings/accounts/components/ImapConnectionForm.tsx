import { Control, Controller } from 'react-hook-form';

import { ImapConnectionFormValues } from '@/settings/accounts/hooks/useImapConnectionForm';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';

const StyledFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type ImapConnectionFormProps = {
  control: Control<ImapConnectionFormValues>;
  isEditing: boolean;
};

export const ImapConnectionForm = ({
  control,
  isEditing,
}: ImapConnectionFormProps) => {
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
          render={({ field, fieldState }) => (
            <TextInput
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
          render={({ field }) => (
            <Select
              label={t`Encryption`}
              options={[
                { label: 'SSL/TLS', value: true },
                { label: 'None', value: false },
              ]}
              value={field.value ? 'SSL/TLS' : 'None'}
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
              label={
                isEditing
                  ? t`Password (leave blank to keep current password)`
                  : t`Password`
              }
              placeholder={t`••••••••`}
              type="password"
              value={field.value || ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="messageVisibility"
          control={control}
          render={({ field }) => (
            <Select
              label={t`Message Visibility`}
              options={[
                {
                  label: 'Share Everything',
                  value: MessageChannelVisibility.SHARE_EVERYTHING,
                },
                {
                  label: 'Share Metadata Only',
                  value: MessageChannelVisibility.METADATA,
                },
                {
                  label: 'Share Subject & Metadata',
                  value: MessageChannelVisibility.SUBJECT,
                },
              ]}
              value={field.value}
              onChange={field.onChange}
              dropdownId="messageVisibility-dropdown"
            />
          )}
        />
      </StyledFormContainer>
    </Section>
  );
};
