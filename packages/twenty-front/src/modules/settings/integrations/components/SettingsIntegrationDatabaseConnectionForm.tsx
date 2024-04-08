import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { TextInput } from '@/ui/input/components/TextInput';

export const settingsIntegrationPostgreSQLConnectionFormSchema = z.object({
  dbname: z.string().min(1),
  host: z.string().min(1),
  port: z.preprocess((val) => parseInt(val as string), z.number().positive()),
  username: z.string().min(1),
  password: z.string().min(1),
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

export const SettingsIntegrationPostgreSQLConnectionForm = () => {
  const { control } =
    useFormContext<SettingsIntegrationPostgreSQLConnectionFormValues>();

  return (
    <StyledInputsContainer>
      {[
        { name: 'dbname' as const, label: 'Database Name' },
        { name: 'host' as const, label: 'Host' },
        { name: 'port' as const, label: 'Port' },
        { name: 'username' as const, label: 'Username' },
        { name: 'password' as const, label: 'Password' },
      ].map(({ name, label }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={label}
              value={value}
              onChange={onChange}
              fullWidth
            />
          )}
        />
      ))}
    </StyledInputsContainer>
  );
};
