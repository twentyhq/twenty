import { Key } from 'ts-key-enum';
import { useCoreAgentField } from '@/object-core/agents/hooks/useCoreAgentField';
import { useUpdateCoreAgentIdentity } from '@/object-core/agents/hooks/useUpdateCoreAgentIdentity';
import { getAgentIcon } from '@/object-core/agents/utils/getAgentIcon';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { CoreAgentDeleteConfirmationModal } from '@/object-core/agents/components/CoreAgentDeleteConfirmationModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const DELETE_AGENT_MODAL_ID = 'delete-agent-modal';

type CoreAgentSettingsTabProps = {
  disabled: boolean;
  agent?: FlatAgent;
};

export const CoreAgentSettingsTab = ({
  disabled,
  agent,
}: CoreAgentSettingsTabProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  const aiModels = useAtomStateValue(aiModelsState);
  const noModelsAvailable = aiModels.length === 0;

  const { value: description, setValue: setDescription } = useCoreAgentField({
    field: 'description',
  });
  const { value: modelId, setValue: setModelId } = useCoreAgentField({
    field: 'modelId',
  });
  const { value: modelConfiguration, setValue: setModelConfiguration } =
    useCoreAgentField({ field: 'modelConfiguration' });
  const { value: prompt, setValue: setPrompt } = useCoreAgentField({
    field: 'prompt',
  });
  const { updateCoreAgentIdentity, isSavingIdentity } =
    useUpdateCoreAgentIdentity();

  return (
    <StyledFormContainer>
      <StyledFormContainer>
        <StyledIconNameRow>
          <IconPicker
            selectedIconKey={getAgentIcon(agent?.icon)}
            onChange={({ iconKey }) => {
              void updateCoreAgentIdentity({ icon: iconKey });
            }}
            disabled={disabled || isSavingIdentity}
          />

          <StyledNameContainer>
            <SettingsTextInput
              instanceId="agent-label-input"
              placeholder={t`Enter agent name*`}
              key={agent?.label}
              inputProps={{ defaultValue: agent?.label }}
              onKeyDown={(event) => {
                if (event.key === Key.Escape) {
                  event.currentTarget.value = agent?.label ?? '';
                }
                if (event.key === Key.Enter || event.key === Key.Escape) {
                  event.currentTarget.blur();
                }
              }}
              onBlur={(event) => {
                const input = event.currentTarget;
                if (input.value === agent?.label) {
                  return;
                }
                void updateCoreAgentIdentity({ label: input.value }).then(
                  (saved) => {
                    if (!saved) {
                      input.value = agent?.label ?? '';
                    }
                  },
                );
              }}
              fullWidth
              disabled={disabled || isSavingIdentity}
            />
          </StyledNameContainer>
        </StyledIconNameRow>
      </StyledFormContainer>
      <StyledFormContainer>
        <TextArea
          textAreaId="agent-description-textarea"
          placeholder={t`Write a description for this agent`}
          minRows={3}
          value={description || ''}
          onChange={setDescription}
          disabled={disabled}
        />
      </StyledFormContainer>
      <StyledFormContainer>
        {noModelsAvailable ? (
          <StyledErrorMessage>
            {t`No AI provider is configured on this instance.`}
          </StyledErrorMessage>
        ) : (
          <AiModelPicker
            modelId={modelId ?? ''}
            onModelIdChange={setModelId}
            disabled={disabled}
          />
        )}
      </StyledFormContainer>
      {modelId && (
        <StyledFormContainer>
          <SettingsAgentModelCapabilities
            selectedModelId={modelId}
            modelConfiguration={modelConfiguration || {}}
            onConfigurationChange={setModelConfiguration}
            disabled={disabled}
          />
        </StyledFormContainer>
      )}
      <StyledFormContainer>
        <TextArea
          textAreaId="agent-prompt-textarea"
          label={t`System Prompt`}
          placeholder={t`Enter the system prompt that defines this agent's behavior and capabilities`}
          minRows={6}
          maxRows={15}
          value={prompt ?? ''}
          onChange={setPrompt}
          disabled={disabled}
        />
      </StyledFormContainer>
      {!disabled && isDefined(agent) && getIsMetadataItemCustom(agent) && (
        <Section.Root>
          <Section.Header
            title={t`Danger zone`}
            description={t`Delete this agent`}
          />
          <Button
            startIcon={<IconTrash />}
            onClick={() => openDialog(DELETE_AGENT_MODAL_ID)}
            variant="outline"
            color="danger"
          >{t`Delete Agent`}</Button>
        </Section.Root>
      )}
      {!disabled && agent && (
        <CoreAgentDeleteConfirmationModal
          agentId={agent.id}
          agentName={agent.label}
        />
      )}
    </StyledFormContainer>
  );
};
