import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import {
  IconCancel,
  IconDeviceFloppy,
  IconSettings,
  IconTerminal,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { CoreObjectIdentifierBar } from '@/object-core/components/CoreObjectIdentifierBar';
import { CoreObjectShowPageTabList } from '@/object-core/components/CoreObjectShowPageTabList';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { CoreAgentPinnedCommandMenuItems } from '@/object-core/commands/components/CoreAgentPinnedCommandMenuItems';
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
import { CoreAgentAvatarPicker } from '@/object-core/agents/components/CoreAgentAvatarPicker';
import { CoreAgentNewRoleDraftEffect } from '@/object-core/agents/components/CoreAgentNewRoleDraftEffect';
import { CORE_AGENT_CANCEL_EDITION_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentCancelEditionCommandId';
import { CORE_AGENT_SAVE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentSaveCommandId';
import { CoreAgentRunsContent } from '@/object-core/agents/components/CoreAgentRunsContent';
import { CoreAgentSettingsContent } from '@/object-core/agents/components/CoreAgentSettingsContent';
import { CORE_AGENT_DELETE_DIALOG_ID } from '@/object-core/agents/constants/CoreAgentDeleteDialogId';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useCoreAgentDirtyState } from '@/object-core/agents/hooks/useCoreAgentDirtyState';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { useRenameCoreAgent } from '@/object-core/agents/hooks/useRenameCoreAgent';
import { useSaveCoreAgent } from '@/object-core/agents/hooks/useSaveCoreAgent';
import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';
import { useCoreAgentShowPageActiveTab } from '@/object-core/agents/hooks/useCoreAgentShowPageActiveTab';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { getCoreAgentShowPageTabListComponentInstanceId } from '@/object-core/agents/utils/getCoreAgentShowPageTabListComponentInstanceId';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

type CoreAgentFormContentProps = {
  agent: FindOneAgentQuery['findOneAgent'];
};

export const CoreAgentFormContent = ({ agent }: CoreAgentFormContentProps) => {
  const { t } = useLingui();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { openDialog } = useDialog();

  const isReadOnly = useIsCoreAgentReadOnly(agent);
  const activeTabId = useCoreAgentShowPageActiveTab(agent.id);

  const { draft, updateDraft } = useCoreAgentDraft(agent);
  const { isDirty } = useCoreAgentDirtyState(agent);
  const { isSaving, saveCoreAgent, discardCoreAgentChanges } =
    useSaveCoreAgent(agent);

  const { renameCoreAgent } = useRenameCoreAgent(agent);

  const handleFieldChange = (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => updateDraft((currentDraft) => ({ ...currentDraft, [field]: value }));

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
                {!isReadOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    startIcon={<IconTrash />}
                    onClick={() => openDialog(CORE_AGENT_DELETE_DIALOG_ID)}
                  >{t`Delete`}</Button>
                )}
                <CoreAgentPinnedCommandMenuItems
                  commandMenuInstanceId={`core-agent-${agent.id}`}
                  containerType={CommandMenuItemContainerType.ShowPageHeader}
                />
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <CoreObjectIdentifierBar
          recordId={agent.id}
          name={agent.label}
          namePlaceholder={t`Untitled`}
          onRename={renameCoreAgent}
          isReadOnly={isReadOnly}
          avatar={
            <CoreAgentAvatarPicker
              agent={agent}
              isReadOnly={isReadOnly}
              size={24}
            />
          }
          tabList={
            <CoreObjectShowPageTabList
              aria-label={t`Agent sections`}
              activeTabId={activeTabId}
              componentInstanceId={getCoreAgentShowPageTabListComponentInstanceId(
                agent.id,
              )}
              tabs={[
                {
                  id: CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS,
                  title: t`Settings`,
                  Icon: IconSettings,
                },
                {
                  id: CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS,
                  title: t`Turns`,
                  Icon: IconTerminal,
                  hide: !isAiChatInboxEnabled,
                },
              ]}
            />
          }
        />
        {activeTabId === CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS ? (
          <CoreAgentRunsContent agentId={agent.id} />
        ) : (
          <SettingsPageContainer>
            <CoreAgentSettingsContent
              agent={agent}
              formValues={draft}
              onFieldChange={handleFieldChange}
              isReadOnly={isReadOnly}
              areTriggersEnabled={isAiChatInboxEnabled}
            />
          </SettingsPageContainer>
        )}
      </PageCardLayout>
      {!isReadOnly && <CoreAgentDeleteConfirmationModal agentId={agent.id} />}
    </>
  );
};
