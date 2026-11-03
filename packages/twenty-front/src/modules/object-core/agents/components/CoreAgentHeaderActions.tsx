import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useCoreAgentDetailView } from '@/object-core/agents/hooks/useCoreAgentDetailView';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { useOpenCoreAgentDeleteDialog } from '@/object-core/agents/hooks/useOpenCoreAgentDeleteDialog';
import { useSaveCoreAgentChanges } from '@/object-core/agents/hooks/useSaveCoreAgentChanges';
import { useSetCoreAgentDetailView } from '@/object-core/agents/hooks/useSetCoreAgentDetailView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconSettings, IconTerminal, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type CoreAgentHeaderActionsProps = { agentId: string };

export const CoreAgentHeaderActions = ({
  agentId,
}: CoreAgentHeaderActionsProps) => {
  const view = useCoreAgentDetailView({ agentId });
  const { isEditable, isDirty, isSaving, canSave } = useCoreAgentEditStatus({
    agentId,
  });
  const { saveCoreAgentChanges } = useSaveCoreAgentChanges({ agentId });
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges({ agentId });
  const { setCoreAgentDetailView } = useSetCoreAgentDetailView({ agentId });
  const { openCoreAgentDeleteDialog } = useOpenCoreAgentDeleteDialog({
    agentId,
  });
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const canReadAgentRuns = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);

  return (
    <>
      {isEditable && (isDirty || isSaving) && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={() => void discardCoreAgentChanges()}
          >{t`Cancel`}</Button>
          <Button
            size="sm"
            disabled={!canSave}
            loading={isSaving}
            onClick={() => void saveCoreAgentChanges()}
          >{t`Save`}</Button>
        </>
      )}
      {isAiChatInboxEnabled && (view === 'runs' || canReadAgentRuns) && (
        <LightIconButton
          aria-label={view === 'runs' ? t`See settings` : t`See runs`}
          onClick={() =>
            setCoreAgentDetailView(view === 'runs' ? 'settings' : 'runs')
          }
        >
          {view === 'runs' ? <IconSettings /> : <IconTerminal />}
        </LightIconButton>
      )}
      {isEditable && (
        <LightIconButton
          aria-label={t`Delete agent`}
          disabled={isSaving}
          onClick={openCoreAgentDeleteDialog}
        >
          <IconTrash />
        </LightIconButton>
      )}
    </>
  );
};
