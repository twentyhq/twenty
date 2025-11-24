import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type Control, Controller } from 'react-hook-form';

import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { type ConnectionFormData } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledConnectionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledSectionDescription = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
`;

const StyledFieldRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledFieldGroup = styled.div`
  flex: 1;

  & > * {
    width: 100%;
  }
`;

type SettingsAccountsConnectionFormProps = {
  control: Control<ConnectionFormData>;
  isEditing: boolean;
};

export const SettingsAccountsConnectionForm = ({
  control,
  isEditing,
}: SettingsAccountsConnectionFormProps) => {
  const { t } = useLingui();

  const getDescription = () => {
    if (isEditing) {
      return t`Update your account's configuration. Configure any combination of IMAP, SMTP, and CalDAV as needed.`;
    }
    return t`You can set up any combination of IMAP (receiving emails), SMTP (sending emails), and CalDAV (calendar sync).`;
  };

  const handlePortChange = (value: string) => Number(value);

  return (
    <Section>
      <H2Title title={t`Mail Account`} description={getDescription()} />
      <StyledFormContainer>
        <Controller
          name="handle"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsTextInput
              instanceId="email-address-connection-form"
              label={t`Email Address`}
              placeholder={t`john.doe@example.com`}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <StyledConnectionSection>
          <StyledSectionHeader>
            <StyledSectionTitle>{t`IMAP Configuration`}</StyledSectionTitle>
            <StyledSectionDescription>
              {t`Configure IMAP settings to receive and sync your emails.`}{' '}
              {t`Leave blank if you don't need to import emails.`}
            </StyledSectionDescription>
          </StyledSectionHeader>

          <Controller
            name="IMAP.host"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="imap-host-connection-form"
                label={t`IMAP Server`}
                placeholder={t`imap.example.com`}
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="IMAP.username"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="imap-username-connection-form"
                label={t`IMAP Username (Optional)`}
                placeholder={t`john.doe`}
                type="text"
                value={field.value || ''}
                required={false}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="IMAP.password"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="imap-password-connection-form"
                label={t`IMAP Password`}
                placeholder={t`••••••••`}
                type="password"
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <StyledFieldRow>
            <StyledFieldGroup>
              <Controller
                name="IMAP.port"
                control={control}
                render={({ field, fieldState }) => (
                  <SettingsTextInput
                    instanceId="imap-port-connection-form"
                    label={t`IMAP Port`}
                    type="number"
                    placeholder="993"
                    value={field?.value ? field.value : 993}
                    onChange={(value) =>
                      field.onChange(handlePortChange(value))
                    }
                    error={fieldState.error?.message}
                  />
                )}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <Controller
                name="IMAP.secure"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t`IMAP Encryption`}
                    options={[
                      { label: 'SSL/TLS', value: true },
                      { label: 'None', value: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    dropdownId="imap-secure-dropdown"
                  />
                )}
              />
            </StyledFieldGroup>
          </StyledFieldRow>
        </StyledConnectionSection>

        <StyledConnectionSection>
          <StyledSectionHeader>
            <StyledSectionTitle>{t`SMTP Configuration`}</StyledSectionTitle>
            <StyledSectionDescription>
              {t`Configure SMTP settings to send emails from your account.`}{' '}
              {t`Leave blank if you don't need to send emails.`}
            </StyledSectionDescription>
          </StyledSectionHeader>

          <Controller
            name="SMTP.host"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="smtp-host-connection-form"
                label={t`SMTP Server`}
                placeholder={t`smtp.example.com`}
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="SMTP.username"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="smtp-username-connection-form"
                label={t`SMTP Username`}
                placeholder={t`john.doe`}
                type="text"
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="SMTP.password"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="smtp-password-connection-form"
                label={t`SMTP Password`}
                placeholder={t`••••••••`}
                type="password"
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <StyledFieldRow>
            <StyledFieldGroup>
              <Controller
                name="SMTP.port"
                control={control}
                render={({ field, fieldState }) => (
                  <SettingsTextInput
                    instanceId="smtp-port-connection-form"
                    label={t`SMTP Port`}
                    type="number"
                    placeholder="587"
                    value={field?.value ? field.value : 587}
                    onChange={(value) =>
                      field.onChange(handlePortChange(value))
                    }
                    error={fieldState.error?.message}
                  />
                )}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <Controller
                name="SMTP.secure"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t`SMTP Encryption`}
                    options={[
                      { label: 'SSL/TLS', value: true },
                      { label: 'STARTTLS', value: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    dropdownId="smtp-secure-dropdown"
                  />
                )}
              />
            </StyledFieldGroup>
          </StyledFieldRow>
        </StyledConnectionSection>

        <StyledConnectionSection>
          <StyledSectionHeader>
            <StyledSectionTitle>{t`CalDAV Configuration`}</StyledSectionTitle>
            <StyledSectionDescription>
              {t`Configure CalDAV settings to sync your calendar events.`}{' '}
              {t`Leave blank if you don't need calendar sync.`}
            </StyledSectionDescription>
          </StyledSectionHeader>

          <Controller
            name="CALDAV.host"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="caldav-host-connection-form"
                label={t`CalDAV Server`}
                placeholder={t`caldav.example.com`}
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="CALDAV.username"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="caldav-username-connection-form"
                label={t`CalDAV Username`}
                placeholder={t`john.doe`}
                required={false}
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="CALDAV.password"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsTextInput
                instanceId="caldav-password-connection-form"
                label={t`CalDAV Password`}
                placeholder={t`••••••••`}
                type="password"
                value={field.value || ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </StyledConnectionSection>
      </StyledFormContainer>
    </Section>
  );
};
