import { type ApplicationVariable } from '~/generated/graphql';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { TextInput } from '@/ui/input/components/TextInput';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsApplicationDetailEnvironmentVariablesTable = ({
  envVariables,
  onUpdate,
}: {
  envVariables: ApplicationVariable[];
  onUpdate: (newEnv: Pick<ApplicationVariable, 'key' | 'value'>) => void;
  readonly?: boolean;
}) => {
  const [editedEnvVariables, setEditedEnvVariables] = useState(envVariables);
  const onUpdateDebounced = useDebouncedCallback(
    (value: Pick<ApplicationVariable, 'key' | 'value'>) => {
      onUpdate(value);
    },
    250,
  );
  return (
    <Section>
      <H2Title
        title={t`Configuration`}
        description={t`Set your application configuration variables`}
      />
      <StyledContainer>
        {editedEnvVariables.map((editedEnvVariable) => (
          <TextInput
            key={editedEnvVariable.key}
            label={editedEnvVariable.key}
            value={editedEnvVariable.value}
            onChange={(newValue) => {
              setEditedEnvVariables((prevState) =>
                prevState.map((val) => {
                  if (val.key === editedEnvVariable.key) {
                    return { ...val, value: newValue };
                  }
                  return val;
                }),
              );
              onUpdateDebounced({ ...editedEnvVariable, value: newValue });
            }}
            placeholder={t`Value`}
            fullWidth
          />
        ))}
      </StyledContainer>
    </Section>
  );
};
