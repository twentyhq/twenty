import { useLingui } from '@lingui/react/macro';
import { type Control, Controller } from 'react-hook-form';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import type { ConnectionFormData } from '@/settings/integrations/hooks/useWhatsappConnectionForm';
import styled from '@emotion/styled';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
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
              label={t`WhatsApp Business Account webhook token`}
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
              label={t`WhatsApp Business Account app secret`}
              placeholder={''}
              value={field.value || ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </StyledFormContainer>
    </Section>
  );
};
