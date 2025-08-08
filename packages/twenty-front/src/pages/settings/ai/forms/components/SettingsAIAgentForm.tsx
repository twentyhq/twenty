import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { isDefined } from 'twenty-shared/utils';
import { useGetRolesQuery } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { SettingsAIAgentFormValues } from '../../hooks/useSettingsAgentFormState';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type SettingsAIAgentFormProps = {
  formValues: SettingsAIAgentFormValues;
  onFieldChange: (
    field: keyof SettingsAIAgentFormValues,
    value: SettingsAIAgentFormValues[keyof SettingsAIAgentFormValues],
  ) => void;
};

export const SettingsAIAgentForm = ({
  formValues,
  onFieldChange,
}: SettingsAIAgentFormProps) => {
  const { t } = useLingui();

  const modelOptions = useAiModelOptions();
  const { data: rolesData } = useGetRolesQuery();

  const rolesOptions =
    rolesData?.getRoles?.map((role) => ({
      label: role.label,
      value: role.id,
    })) || [];

  const noModelsAvailable = modelOptions.length === 0;

  const fillNameFromLabel = (label: string) => {
    isDefined(label) &&
      onFieldChange('name', computeMetadataNameFromLabel(label));
  };

  return (
    <StyledFormContainer>
      <StyledFormContainer>
        <StyledIconNameRow>
          <IconPicker
            selectedIconKey={formValues.icon || 'IconRobot'}
            onChange={({ iconKey }) => {
              onFieldChange('icon', iconKey);
            }}
          />

          <StyledNameContainer>
            <SettingsTextInput
              instanceId="agent-label-input"
              placeholder={t`Enter agent name*`}
              value={formValues.label}
              onChange={(value) => {
                onFieldChange('label', value);
                fillNameFromLabel(value);
              }}
              fullWidth
            />
          </StyledNameContainer>
        </StyledIconNameRow>
      </StyledFormContainer>

      <StyledFormContainer>
        <TextArea
          textAreaId="agent-description-textarea"
          placeholder={t`Write a description for this agent`}
          minRows={3}
          value={formValues.description || ''}
          onChange={(value) => onFieldChange('description', value)}
        />
      </StyledFormContainer>

      <StyledFormContainer>
        <Select
          dropdownId="ai-model-select"
          label={t`AI Model`}
          value={formValues.modelId}
          onChange={(value) => onFieldChange('modelId', value)}
          options={modelOptions}
          disabled={noModelsAvailable}
        />
        {noModelsAvailable && (
          <StyledErrorMessage>
            {t`No models available. Please configure AI models in your workspace settings.`}
          </StyledErrorMessage>
        )}
      </StyledFormContainer>

      <StyledFormContainer>
        <Select
          dropdownId="ai-role-select"
          label={t`Role`}
          value={formValues.role || ''}
          onChange={(value) => onFieldChange('role', value)}
          options={rolesOptions}
          emptyOption={{
            label: t`Select a role`,
            value: '',
          }}
        />
      </StyledFormContainer>

      <StyledFormContainer>
        <TextArea
          textAreaId="agent-prompt-textarea"
          label={t`System Prompt*`}
          placeholder={t`Enter the system prompt that defines this agent's behavior and capabilities`}
          minRows={6}
          value={formValues.prompt}
          onChange={(value) => onFieldChange('prompt', value)}
        />
      </StyledFormContainer>
    </StyledFormContainer>
  );
};
