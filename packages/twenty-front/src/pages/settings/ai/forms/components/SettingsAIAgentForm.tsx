import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';

import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useGetRolesQuery } from '~/generated-metadata/graphql';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAIAgentForm = () => {
  const { control } = useFormContext();
  const { t } = useLingui();

  const modelOptions = useAiModelOptions();
  const { data: rolesData } = useGetRolesQuery();

  const rolesOptions =
    rolesData?.getRoles?.map((role) => ({
      label: role.label,
      value: role.id,
    })) || [];

  const noModelsAvailable = modelOptions.length === 0;

  return (
    <StyledInputsContainer>
      <StyledFormSection>
        <StyledIconNameRow>
          <StyledIconContainer>
            <Controller
              name="icon"
              control={control}
              defaultValue="IconRobot"
              render={({ field: { onChange, value } }) => (
                <IconPicker
                  selectedIconKey={value}
                  onChange={({ iconKey }) => {
                    onChange(iconKey);
                  }}
                />
              )}
            />
          </StyledIconContainer>

          <StyledNameContainer>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({
                field: { onChange, value },
                formState: { errors },
              }) => (
                <TextInput
                  instanceId="agent-name-input"
                  placeholder={t`Enter agent name`}
                  value={value}
                  onChange={onChange}
                  error={
                    errors.name?.message
                      ? String(errors.name.message)
                      : undefined
                  }
                  noErrorHelper={true}
                  fullWidth
                />
              )}
            />
          </StyledNameContainer>
        </StyledIconNameRow>

        <Controller
          name="label"
          control={control}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              instanceId="agent-label-input"
              placeholder={t`Enter label`}
              value={value}
              onChange={onChange}
              noErrorHelper={true}
              fullWidth
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextArea
              textAreaId="agent-description-textarea"
              placeholder={t`Write a description for this agent`}
              minRows={3}
              value={value ?? undefined}
              onChange={(nextValue) => onChange(nextValue ?? null)}
            />
          )}
        />
      </StyledFormSection>

      <StyledFormSection>
        <Controller
          name="modelId"
          control={control}
          defaultValue="auto"
          render={({ field: { onChange, value } }) => (
            <Select
              dropdownId="ai-model-select"
              label={t`AI Model`}
              value={value}
              onChange={onChange}
              options={modelOptions}
              disabled={noModelsAvailable}
              fullWidth
            />
          )}
        />
        {noModelsAvailable && (
          <StyledErrorMessage>
            {t`You haven't configured any model provider. Please set up an API Key in your instance's admin panel or as an environment variable.`}
          </StyledErrorMessage>
        )}

        <Controller
          name="role"
          control={control}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <Select
              dropdownId="ai-role-select"
              label={t`Role`}
              value={value}
              onChange={onChange}
              options={rolesOptions}
              emptyOption={{
                label: t`Select a role`,
                value: '',
              }}
              fullWidth
            />
          )}
        />

        <Controller
          name="prompt"
          control={control}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextArea
              textAreaId="agent-prompt-textarea"
              label={t`System Prompt`}
              placeholder={t`Enter the system prompt that defines this agent's behavior and capabilities`}
              minRows={6}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </StyledFormSection>
    </StyledInputsContainer>
  );
};
