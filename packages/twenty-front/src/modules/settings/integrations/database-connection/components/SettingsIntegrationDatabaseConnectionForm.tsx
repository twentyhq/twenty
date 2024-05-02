import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { TextInput } from '@/ui/input/components/TextInput';

export const settingsIntegrationPostgreSQLConnectionFormSchema = z.object({
  dbname: z.string().min(1),
  host: z.string().min(1),
  port: z.preprocess((val) => parseInt(val as string), z.number().positive()),
  user: z.string().min(1),
  password: z.string().min(1),
  schema: z.string().min(1),
});

type SettingsIntegrationPostgreSQLConnectionFormValues = z.infer<
  typeof settingsIntegrationPostgreSQLConnectionFormSchema
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

type SettingsIntegrationPostgreSQLConnectionFormProps = {
  disabled?: boolean;
};

export const SettingsIntegrationPostgreSQLConnectionForm = ({
  disabled,
}: SettingsIntegrationPostgreSQLConnectionFormProps) => {
  const { control } =
    useFormContext<SettingsIntegrationPostgreSQLConnectionFormValues>();

  return (
    <StyledInputsContainer>
      {[
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
      ].map(({ name, label, type, placeholder }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <TextInput
                autoComplete="new-password"
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
