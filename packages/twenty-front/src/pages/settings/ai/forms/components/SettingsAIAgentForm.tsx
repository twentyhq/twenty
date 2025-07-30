import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';

import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useGetRolesQuery } from '~/generated-metadata/graphql';

import { SettingsAIAgentFormValues } from '~/pages/settings/ai/validation-schemas/settingsAIAgentFormSchema';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type SettingsAIAgentFormProps = {
  onNewDirtyField?: () => void;
};

export const SettingsAIAgentForm = ({
  onNewDirtyField,
}: SettingsAIAgentFormProps) => {
  const { control, watch } = useFormContext<SettingsAIAgentFormValues>();
  const { t } = useLingui();

  const name = watch('name');
  const label = watch('label');
  const description = watch('description');
  const icon = watch('icon');
  const modelId = watch('modelId');
  const prompt = watch('prompt');

  // Get AI models and roles from backend
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
                    onNewDirtyField?.();
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
                  onBlur={() => onNewDirtyField?.()}
                  error={errors.name?.message}
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
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <TextInput
              instanceId="agent-label-input"
              placeholder={t`Enter label`}
              value={value}
              onChange={onChange}
              onBlur={() => onNewDirtyField?.()}
              error={errors.label?.message}
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
              onBlur={() => onNewDirtyField?.()}
            />
          )}
        />
      </StyledFormSection>

      <StyledFormSection>
        <Controller
          name="modelId"
          control={control}
          defaultValue="auto"
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <Select
              dropdownId="ai-model-select"
              label={t`AI Model`}
              value={value}
              onChange={onChange}
              onBlur={() => onNewDirtyField?.()}
              options={modelOptions}
              disabled={noModelsAvailable}
              fullWidth
            />
          )}
        />

        {noModelsAvailable && (
          <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
            {t`You haven't configured any model provider. Please set up an API Key in your instance's admin panel or as an environment variable.`}
          </div>
        )}

        <Controller
          name="role"
          control={control}
          defaultValue=""
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <Select
              dropdownId="ai-role-select"
              label={t`Role`}
              value={value}
              onChange={onChange}
              onBlur={() => onNewDirtyField?.()}
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
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <TextArea
              textAreaId="agent-prompt-textarea"
              label={t`System Prompt`}
              placeholder={t`Enter the system prompt that defines this agent's behavior and capabilities`}
              minRows={6}
              value={value}
              onChange={onChange}
              onBlur={() => onNewDirtyField?.()}
            />
          )}
        />
      </StyledFormSection>
    </StyledInputsContainer>
  );
};
