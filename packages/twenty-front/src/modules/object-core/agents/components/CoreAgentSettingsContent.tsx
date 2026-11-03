import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { CoreAgentDataAccessSection } from '@/object-core/agents/components/CoreAgentDataAccessSection';
import { CoreAgentToolsSection } from '@/object-core/agents/components/CoreAgentToolsSection';
import { CoreAgentTriggersTab } from '@/object-core/agents/components/CoreAgentTriggersTab';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useCoreAgentField } from '@/object-core/agents/hooks/useCoreAgentField';
import { TextArea } from '@/ui/input/components/TextArea';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledContent = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  margin: 0 auto;
  max-width: 720px;
  padding: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

type CoreAgentSettingsContentProps = { agentId: string };

export const CoreAgentSettingsContent = ({
  agentId,
}: CoreAgentSettingsContentProps) => {
  const { isEditable, canReadRoles, session, roleId } = useCoreAgentEditStatus({
    agentId,
  });
  const { value: prompt = '', setValue: setPrompt } = useCoreAgentField({
    agentId,
    field: 'prompt',
  });
  const { value: description, setValue: setDescription } = useCoreAgentField({
    agentId,
    field: 'description',
  });
  const { value: modelId = '', setValue: setModelId } = useCoreAgentField({
    agentId,
    field: 'modelId',
  });
  const { value: modelConfiguration, setValue: setModelConfiguration } =
    useCoreAgentField({ agentId, field: 'modelConfiguration' });
  const aiModels = useAtomStateValue(aiModelsState);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  return (
    <StyledContent>
      {canReadRoles && isDefined(session?.roleId) && (
        <SettingsRoleDraftSyncEffect roleId={roleId} />
      )}
      {isAiChatInboxEnabled && (
        <CoreAgentTriggersTab agentId={agentId} disabled={!isEditable} />
      )}
      <Section.Root>
        <Section.Header title={t`Instructions`} />
        <TextArea
          textAreaId={`agent-instructions-${agentId}`}
          aria-label={t`Instructions`}
          placeholder={t`Write instructions for this agent`}
          minRows={6}
          maxRows={15}
          value={prompt}
          onChange={setPrompt}
          disabled={!isEditable}
        />
      </Section.Root>
      <CoreAgentDataAccessSection agentId={agentId} />
      <CoreAgentToolsSection agentId={agentId} />
      <Section.Root>
        <Section.Header title={t`Model`} />
        {!isNonEmptyArray(aiModels) ? (
          <Text color="secondary">{t`No AI provider is configured on this instance.`}</Text>
        ) : (
          <AiModelPicker
            modelId={modelId}
            onModelIdChange={setModelId}
            disabled={!isEditable}
          />
        )}
        <SettingsAgentModelCapabilities
          selectedModelId={modelId}
          modelConfiguration={modelConfiguration ?? {}}
          onConfigurationChange={setModelConfiguration}
          disabled={!isEditable}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header title={t`Description`} />
        <TextArea
          textAreaId={`agent-description-${agentId}`}
          aria-label={t`Description`}
          placeholder={t`Describe what this agent does`}
          minRows={3}
          value={description ?? ''}
          onChange={setDescription}
          disabled={!isEditable}
        />
      </Section.Root>
    </StyledContent>
  );
};
