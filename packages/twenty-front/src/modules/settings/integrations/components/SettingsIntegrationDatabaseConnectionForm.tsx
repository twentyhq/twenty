import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { TextInput } from '@/ui/input/components/TextInput';

export const settingsIntegrationDatabaseConnectionFormSchema = z.object({
  workspaceName: z.string().min(1),
  workspaceApiKey: z.string().min(1),
});

type SettingsIntegrationDatabaseConnectionFormValues = z.infer<
  typeof settingsIntegrationDatabaseConnectionFormSchema
>;

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsIntegrationDatabaseConnectionForm = () => {
  const { control } =
    useFormContext<SettingsIntegrationDatabaseConnectionFormValues>();

  return (
    <StyledInputsContainer>
      {[
        { name: 'workspaceName' as const, label: 'Workspace name' },
        { name: 'workspaceApiKey' as const, label: 'Workspace API Key' },
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
