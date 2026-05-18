import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type Control, Controller } from 'react-hook-form';

import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { type ConnectionFormData } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';
import { type AccountType } from 'twenty-shared/constants';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

const StyledConnectionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionHeader = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSectionTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledSectionDescription = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledFieldRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};

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

type SettingsAccountsConnectionFormProps = {
  control: Control<ConnectionFormData>;
  isEditing: boolean;
  existingProtocols?: AccountType[];
};

export const SettingsAccountsConnectionForm = ({
  control,
  isEditing,
  existingProtocols = [],
}: SettingsAccountsConnectionFormProps) => {
  const { t } = useLingui();

  const [isPasswordEdited, setIsPasswordEdited] = useState<
    Record<AccountType, boolean>
  >({ IMAP: false, SMTP: false, CALDAV: false });

  const passwordDisabledByProtocol: Record<AccountType, boolean> = {
    IMAP: existingProtocols.includes('IMAP') && !isPasswordEdited.IMAP,
    SMTP: existingProtocols.includes('SMTP') && !isPasswordEdited.SMTP,
    CALDAV: existingProtocols.includes('CALDAV') && !isPasswordEdited.CALDAV,
  };

  const unlockPassword = (protocol: AccountType) => {
    setIsPasswordEdited((prev) => ({ ...prev, [protocol]: true }));
  };

  const MASKED_PASSWORD_PLACEHOLDER = '••••••••';

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
              <StyledPasswordFieldContainer>
                <SettingsTextInput
                  instanceId="imap-password-connection-form"
                  label={t`IMAP Password`}
                  placeholder={
                    passwordDisabledByProtocol.IMAP
                      ? MASKED_PASSWORD_PLACEHOLDER
                      : ''
                  }
                  type={passwordDisabledByProtocol.IMAP ? 'text' : 'password'}
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={passwordDisabledByProtocol.IMAP}
                />
                {passwordDisabledByProtocol.IMAP && (
                  <StyledEditPasswordLink
                    type="button"
                    onClick={() => unlockPassword('IMAP')}
                  >
                    {t`Change password`}
                  </StyledEditPasswordLink>
                )}
              </StyledPasswordFieldContainer>
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
              <StyledPasswordFieldContainer>
                <SettingsTextInput
                  instanceId="smtp-password-connection-form"
                  label={t`SMTP Password`}
                  placeholder={
                    passwordDisabledByProtocol.SMTP
                      ? MASKED_PASSWORD_PLACEHOLDER
                      : ''
                  }
                  type={passwordDisabledByProtocol.SMTP ? 'text' : 'password'}
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={passwordDisabledByProtocol.SMTP}
                />
                {passwordDisabledByProtocol.SMTP && (
                  <StyledEditPasswordLink
                    type="button"
                    onClick={() => unlockPassword('SMTP')}
                  >
                    {t`Change password`}
                  </StyledEditPasswordLink>
                )}
              </StyledPasswordFieldContainer>
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
              <StyledPasswordFieldContainer>
                <SettingsTextInput
                  instanceId="caldav-password-connection-form"
                  label={t`CalDAV Password`}
                  placeholder={
                    passwordDisabledByProtocol.CALDAV
                      ? MASKED_PASSWORD_PLACEHOLDER
                      : ''
                  }
                  type={
                    passwordDisabledByProtocol.CALDAV ? 'text' : 'password'
                  }
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={passwordDisabledByProtocol.CALDAV}
                />
                {passwordDisabledByProtocol.CALDAV && (
                  <StyledEditPasswordLink
                    type="button"
                    onClick={() => unlockPassword('CALDAV')}
                  >
                    {t`Change password`}
                  </StyledEditPasswordLink>
                )}
              </StyledPasswordFieldContainer>
            )}
          />
        </StyledConnectionSection>
      </StyledFormContainer>
    </Section>
  );
};
