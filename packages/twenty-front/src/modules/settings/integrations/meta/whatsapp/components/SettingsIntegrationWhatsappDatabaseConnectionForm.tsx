import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SettingsIntegrationWhatsappConnectionFormValues } from '~/pages/settings/integrations/whatsapp/SettingsIntegrationWhatsappNewDatabaseConnection';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type SettingsIntegrationWhatsappDatabaseConnectionFormProps = {
  disabled?: boolean;
};

const getFormFields = (): {
  name: keyof SettingsIntegrationWhatsappConnectionFormValues;
  label: string;
  type?: string;
  placeholder: string;
}[] => {
  return [
    {
      name: 'name',
      label: 'Inbox name',
      placeholder: 'Integration name',
      type: 'text',
    },
    {
      name: 'phoneId',
      label: 'Phone ID',
      placeholder: 'Enter the phone number ID obtained from Facebook Developer',
      type: 'text',
    },
    {
      name: 'businessAccountId',
      label: 'Business Account ID',
      placeholder:
        'Enter the Business Account ID obtained from Facebook Developer',
      type: 'text',
    },
    {
      name: 'accessToken',
      label: 'Access Token',
      placeholder: 'Enter the Access Token obtained from Facebook Developer',
      type: 'text',
    },
    {
      name: 'appId',
      label: 'APP ID',
      placeholder: 'Enter the APP ID obtained from Facebook Developer',
      type: 'text',
    },
    {
      name: 'appKey',
      label: 'APP Secret Key',
      placeholder: 'Enter the APP Secret Key obtained from Facebook Developer',
    },
  ];
};

export const SettingsIntegrationWhatsappDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationWhatsappDatabaseConnectionFormProps) => {
  const { control } =
    useFormContext<SettingsIntegrationWhatsappConnectionFormValues>();
  const formFields = getFormFields();

  if (!formFields) return null;

  return (
    <StyledInputsContainer>
      {formFields.map(({ name, label, type, placeholder }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <TextInputV2
                autoComplete="new-password" // Disable autocomplete
                label={label}
                value={value}
                onChange={onChange}
                fullWidth
                type={type}
                disabled={disabled}
                placeholder={placeholder}
              />
            );
          }}
        />
      ))}
    </StyledInputsContainer>
  );
};
