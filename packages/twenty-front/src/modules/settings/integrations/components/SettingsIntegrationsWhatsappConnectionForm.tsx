import { useLingui } from '@lingui/react/macro';
import { type Control, Controller } from 'react-hook-form';
import { H2Title, IconFileInfo } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import type { ConnectionFormData } from '@/settings/integrations/hooks/useWhatsappConnectionForm';
import styled from '@emotion/styled';
import { Button } from 'twenty-ui/input';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.xxl};
`;

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

type SettingsIntegrationsWhatsappConnectionFormProps = {
  control: Control<ConnectionFormData>;
  isEditing: boolean;
};

export const SettingsIntegrationsWhatsappConnectionForm = ({
  isEditing = false,
  control,
}: SettingsIntegrationsWhatsappConnectionFormProps) => {
  const { t } = useLingui();

  const getDescription = () => {
    if (isEditing) {
      return t`Update your WhatsApp Business Account's configuration.`;
    }
    return t`You can set up connection with your WhatsApp Business Account.`;
  };

  return (
    <Section>
      <H2Title title={t`WhatsApp connection`} description={getDescription()} />
      <StyledFormContainer>
        <Controller
          name="businessId"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsTextInput
              instanceId="business-id-whatsapp-connection-form"
              label={t`WhatsApp Business Account ID`}
              placeholder={''}
              value={field.value || ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="webhookToken"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsTextInput
              instanceId="webhook-token-whatsapp-connection-form"
              label={t`Webhook token`}
              placeholder={''}
              value={field.value || ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="appSecret"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsTextInput
              instanceId="app-secret-whatsapp-connection-form"
              label={t`App secret`}
              placeholder={''}
              value={field.value || ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="bearerToken"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsTextInput
              instanceId="bearer-token-whatsapp-connection-form"
              label={t`Bearer token`}
              placeholder={''}
              value={field.value || ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <StyledInfoContainer>
          <StyledTitle>Disclaimer</StyledTitle>
          <StyledInfoContainer>
            While we are trying our best to make sure that integration is
            compatible with WhatsApp API and Meta's Policy, we cannot guarantee
            that your account will not be banned by Meta due to
            improper/non-compliant usage of official API as it's usage is beyond
            our control.
            <StyledButtonContainer>
              <Button
                Icon={IconFileInfo}
                title={t`More info here`}
                onClick={() =>
                  window.open(
                    'https://developers.facebook.com/documentation/business-messaging/whatsapp/policy-enforcement',
                  )
                }
              />
            </StyledButtonContainer>
          </StyledInfoContainer>
        </StyledInfoContainer>
      </StyledFormContainer>
    </Section>
  );
};
