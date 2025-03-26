/* eslint-disable react/jsx-no-undef */
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { FileInput } from '@/settings/integrations/inter/components/FileInputProps';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SettingsIntegrationInterConnectionFormValues } from '~/pages/settings/integrations/inter/SettingsIntegrationInterNewDatabaseConnection';
const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: 15px;
  width: 100%;
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledFullWidthInput = styled.div`
  width: 100%;
`;

const StyledHalfWidthInput = styled.div`
  width: 50%;
`;

type SettingsIntegrationInterDatabaseConnectionFormProps = {
  disabled?: boolean;
};

const getFormFields = (): {
  name: keyof SettingsIntegrationInterConnectionFormValues;
  label: string;
  type?: string;
  placeholder: string;
}[] => {
  return [
    {
      name: 'integrationName',
      label: 'Integration name',
      placeholder: 'Banco Inter',
      type: 'text',
    },
    {
      name: 'clientId',
      label: 'Cliente ID',
      placeholder: '********_****_****_****_****',
      type: 'text',
    },
    {
      name: 'clientSecret',
      label: 'Client Secret',
      placeholder: '********_****_****_****_****',
      type: 'text',
    },
  ];
};

export const SettingsIntegrationInterDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationInterDatabaseConnectionFormProps) => {
  const { control } =
    useFormContext<SettingsIntegrationInterConnectionFormValues>();
  const formFields = getFormFields();

  if (!formFields) return null;
  const [integrationNameField, clientIdField, clientSecretField] = formFields;

  return (
    <StyledFormContainer>
      {/* Primeira linha - Integration Name */}
      <StyledRow>
        <StyledFullWidthInput>
          <Controller
            name={integrationNameField.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                label={integrationNameField.label}
                value={value}
                onChange={onChange}
                fullWidth
                type={integrationNameField.type}
                disabled={disabled}
                placeholder={integrationNameField.placeholder}
              />
            )}
          />
        </StyledFullWidthInput>
      </StyledRow>

      {/* Segunda linha - Cliente ID e Cliente Secret */}
      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name={clientIdField.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                autoComplete="new-password"
                label={clientIdField.label}
                value={value}
                onChange={onChange}
                fullWidth
                type={clientIdField.type}
                disabled={disabled}
                placeholder={clientIdField.placeholder}
              />
            )}
          />
        </StyledHalfWidthInput>

        <StyledHalfWidthInput>
          <Controller
            name={clientSecretField.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                autoComplete="new-password"
                label={clientSecretField.label}
                value={value}
                onChange={onChange}
                fullWidth
                type={clientSecretField.type}
                disabled={disabled}
                placeholder={clientSecretField.placeholder}
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      {/* Terceira linha - Private Key */}
      <StyledRow>
        <StyledFullWidthInput>
          <FileInput
            name="privateKey"
            label="Private Key"
            disabled={disabled}
            accept=".pem,.key"
          />
        </StyledFullWidthInput>
      </StyledRow>

      {/* Quarta linha - Certificate */}
      <StyledRow>
        <StyledFullWidthInput>
          <FileInput
            name="certificate"
            label="Certificate"
            disabled={disabled}
            accept=".pem,.crt,.cer"
          />
        </StyledFullWidthInput>
      </StyledRow>
    </StyledFormContainer>
  );
};
