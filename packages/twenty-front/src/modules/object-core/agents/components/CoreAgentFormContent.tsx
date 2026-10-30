import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import {
  IconCancel,
  IconDeviceFloppy,
  IconSettings,
  IconTerminal,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { CoreObjectIdentifierBar } from '@/object-core/components/CoreObjectIdentifierBar';
import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type FindOneAgentQuery,
} from '~/generated-metadata/graphql';
import { CoreAgentDeleteConfirmationModal } from '@/object-core/agents/components/CoreAgentDeleteConfirmationModal';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { CoreAgentNewRoleDraftEffect } from '@/object-core/agents/components/CoreAgentNewRoleDraftEffect';
import { CORE_AGENT_CANCEL_EDITION_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentCancelEditionCommandId';
import { CORE_AGENT_SAVE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentSaveCommandId';
import { CoreAgentRunsContent } from '@/object-core/agents/components/CoreAgentRunsContent';
import { CoreAgentSettingsContent } from '@/object-core/agents/components/CoreAgentSettingsContent';
import { CORE_AGENT_DELETE_DIALOG_ID } from '@/object-core/agents/constants/CoreAgentDeleteDialogId';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useCoreAgentDirtyState } from '@/object-core/agents/hooks/useCoreAgentDirtyState';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { useSaveCoreAgent } from '@/object-core/agents/hooks/useSaveCoreAgent';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

type CoreAgentFormContentProps = {
  agent: FindOneAgentQuery['findOneAgent'];
};

export const CoreAgentFormContent = ({ agent }: CoreAgentFormContentProps) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { openDialog } = useDialog();

  const isReadOnly = useIsCoreAgentReadOnly(agent);
  const [isRunsView, setIsRunsView] = useState(false);

  const { draft, updateDraft } = useCoreAgentDraft(agent);
  const { isDirty } = useCoreAgentDirtyState(agent);
  const { isSaving, saveCoreAgent, discardCoreAgentChanges } =
    useSaveCoreAgent(agent);

  const handleFieldChange = (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => updateDraft((currentDraft) => ({ ...currentDraft, [field]: value }));

  const handleRename = async (label: string) => {
    const trimmedLabel = label.trim();
    const name = computeMetadataNameFromLabel(trimmedLabel);

    if (!isNonEmptyString(name) || trimmedLabel === draft.label) {
      return true;
    }

    updateDraft((currentDraft) => ({
      ...currentDraft,
      label: trimmedLabel,
      name,
    }));

    return true;
  };

  const agentRecord = useMemo(
    () => ({
      __typename: 'Agent',
      id: agent.id,
      name: agent.label,
      createdAt: agent.createdAt,
    }),
    [agent.id, agent.label, agent.createdAt],
  );

  const title = isNonEmptyString(agent.label) ? agent.label : t`Untitled`;
  const isShowingRuns = isAiChatInboxEnabled && isRunsView;

  return (
    <>
      <SettingsRolesQueryEffect />
      {isNonEmptyString(agent.roleId) ? (
        <SettingsRoleDraftSyncEffect roleId={agent.roleId} />
      ) : (
        <CoreAgentNewRoleDraftEffect agent={agent} />
      )}
      <RecordShowPageResourceEffect
        loading={false}
        record={agentRecord}
        recordId={agent.id}
      />
      <PageTitle title={title} />
      <PageCardLayout
        header={
          <PageCardHeader
            links={getCoreAgentBreadcrumbLinks([{ children: title }])}
            actionButton={
              <>
                {!isReadOnly && isDirty && (
                  <>
                    <CommandMenuButton
                      command={{
                        key: CORE_AGENT_SAVE_COMMAND_ID,
                        label: t`Save Agent`,
                        shortLabel: t`Save`,
                        Icon: IconDeviceFloppy,
                      }}
                      onClick={saveCoreAgent}
                      loading={isSaving}
                    />
                    <CommandMenuButton
                      command={{
                        key: CORE_AGENT_CANCEL_EDITION_COMMAND_ID,
                        label: t`Cancel Edition`,
                        shortLabel: t`Cancel`,
                        Icon: IconCancel,
                      }}
                      onClick={discardCoreAgentChanges}
                    />
                  </>
                )}
                {isAiChatInboxEnabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    startIcon={
                      isShowingRuns ? <IconSettings /> : <IconTerminal />
                    }
                    onClick={() => setIsRunsView(!isRunsView)}
                  >
                    {isShowingRuns ? t`Settings` : t`Runs`}
                  </Button>
                )}
                {!isReadOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    startIcon={<IconTrash />}
                    onClick={() => openDialog(CORE_AGENT_DELETE_DIALOG_ID)}
                  >{t`Delete`}</Button>
                )}
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <CoreObjectIdentifierBar
          recordId={agent.id}
          name={draft.label}
          namePlaceholder={t`Untitled`}
          onRename={handleRename}
          isReadOnly={isReadOnly}
          icon={<CoreAgentIcon agentId={agent.id} size={24} />}
        />
        <SettingsPageContainer>
          {isShowingRuns ? (
            <CoreAgentRunsContent agentId={agent.id} />
          ) : (
            <CoreAgentSettingsContent
              agent={agent}
              formValues={draft}
              onFieldChange={handleFieldChange}
              isReadOnly={isReadOnly}
              areTriggersEnabled={isAiChatInboxEnabled}
            />
          )}
        </SettingsPageContainer>
      </PageCardLayout>
      {!isReadOnly && (
        <CoreAgentDeleteConfirmationModal
          agentId={agent.id}
          agentName={agent.label}
        />
      )}
    </>
  );
};
