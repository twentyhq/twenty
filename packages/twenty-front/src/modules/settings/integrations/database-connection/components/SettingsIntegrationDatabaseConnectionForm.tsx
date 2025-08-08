import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

export const settingsIntegrationPostgreSQLConnectionFormSchema = z.object({
  dbname: z.string().min(1),
  host: z.string().min(1),
  port: z.preprocess((val) => parseInt(val as string), z.number().positive()),
  user: z.string().min(1),
  password: z.string().min(1),
  schema: z.string().min(1),
  label: z.string().min(1),
});

type SettingsIntegrationPostgreSQLConnectionFormValues = z.infer<
  typeof settingsIntegrationPostgreSQLConnectionFormSchema
>;

export const settingsIntegrationStripeConnectionFormSchema = z.object({
  api_key: z.string().min(1),
  label: z.string().min(1),
});

type SettingsIntegrationStripeConnectionFormValues = z.infer<
  typeof settingsIntegrationStripeConnectionFormSchema
>;

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'input-1 input-1'
    'input-2 input-3'
    'input-4 input-5';

  & :first-of-type {
    grid-area: input-1;
  }
`;

type SettingsIntegrationDatabaseConnectionFormProps = {
  databaseKey: string;
  disabled?: boolean;
};

type SettingsIntegrationConnectionFormValues =
  | SettingsIntegrationPostgreSQLConnectionFormValues
  | SettingsIntegrationStripeConnectionFormValues;

const getFormFields = (
  databaseKey: string,
):
  | {
      name:
        | 'dbname'
        | 'host'
        | 'port'
        | 'user'
        | 'password'
        | 'schema'
        | 'api_key'
        | 'label';
      label: string;
      type?: string;
      placeholder: string;
    }[]
  | null => {
  switch (databaseKey) {
    case 'postgresql':
      return [
        {
          name: 'dbname' as const,
          label: 'Database Name',
          placeholder: 'default',
        },
        { name: 'host' as const, label: 'Host', placeholder: 'host' },
        { name: 'port' as const, label: 'Port', placeholder: '5432' },
        {
          name: 'user' as const,
          label: 'User',
          placeholder: 'user',
        },
        {
          name: 'password' as const,
          label: 'Password',
          type: 'password',
          placeholder: '••••••',
        },
        { name: 'schema' as const, label: 'Schema', placeholder: 'public' },
        {
          name: 'label' as const,
          label: 'Label',
          placeholder: 'My database',
        },
      ];
    case 'stripe':
      return [
        { name: 'api_key' as const, label: 'API Key', placeholder: 'API key' },
        {
          name: 'label' as const,
          label: 'Label',
          placeholder: 'My database',
        },
      ];
    default:
      return null;
  }
};

export const SettingsIntegrationDatabaseConnectionForm = ({
  databaseKey,
  disabled,
}: SettingsIntegrationDatabaseConnectionFormProps) => {
  const { control } = useFormContext<SettingsIntegrationConnectionFormValues>();
  const formFields = getFormFields(databaseKey);

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
              <SettingsTextInput
                instanceId={`${databaseKey}-${name}`}
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
