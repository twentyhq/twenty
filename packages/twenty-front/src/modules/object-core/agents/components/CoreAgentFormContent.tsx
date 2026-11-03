import { CoreAgentEditSessionEffect } from '@/object-core/agents/components/CoreAgentEditSessionEffect';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useSaveCoreAgentChanges } from '@/object-core/agents/hooks/useSaveCoreAgentChanges';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { Button } from 'twenty-ui/primitives/input';
import { getAgentIcon } from '@/object-core/agents/utils/getAgentIcon';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconBolt, IconLock, IconSettings, IconTerminal } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type FindOneAgentQuery,
} from '~/generated-metadata/graphql';
import { CoreAgentRoleTab } from '@/object-core/agents/components/CoreAgentRoleTab';
import { CoreAgentRunsTab } from '@/object-core/agents/components/CoreAgentRunsTab';
import { CoreAgentSettingsTab } from '@/object-core/agents/components/CoreAgentSettingsTab';
import { CoreAgentTriggersTab } from '@/object-core/agents/components/CoreAgentTriggersTab';
import { CORE_AGENT_DETAIL_TABS } from '@/object-core/agents/constants/CoreAgentDetailTabs';

const StyledContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

type CoreAgentFormContentProps = {
  agent: FindOneAgentQuery['findOneAgent'];
};

export const CoreAgentFormContent = ({ agent }: CoreAgentFormContentProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const agentId = agent.id;

  const tabListComponentId = `${CORE_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${agentId}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const {
    session,
    isEditable,
    canReadRoles,
    isDirty,
    canSave,
    isSaving,
    validationError,
    error,
    resetVersion,
  } = useCoreAgentEditStatus();
  const { saveCoreAgentChanges } = useSaveCoreAgentChanges();
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges();

  const tabs = [
    {
      id: CORE_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    },
    {
      id: CORE_AGENT_DETAIL_TABS.TABS_IDS.ROLE,
      title: t`Role`,
      Icon: IconLock,
    },
    ...(isAiChatInboxEnabled
      ? [
          {
            id: CORE_AGENT_DETAIL_TABS.TABS_IDS.TRIGGERS,
            title: t`Triggers`,
            Icon: IconBolt,
          },
          {
            id: CORE_AGENT_DETAIL_TABS.TABS_IDS.RUNS,
            title: t`Runs`,
            Icon: IconTerminal,
          },
        ]
      : []),
  ];

  const title = agent.label;
  const AgentIcon = getIcon(getAgentIcon(agent.icon));

  const isRoleTab = activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.ROLE;
  const isSettingsTab =
    activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS;
  const isTriggersTab =
    isAiChatInboxEnabled &&
    activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.TRIGGERS;
  const isRunsTab =
    isAiChatInboxEnabled &&
    activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.RUNS;

  const isFormDisabled = !isEditable;

  return (
    <>
      {canReadRoles && <SettingsRolesQueryEffect />}
      <CoreAgentEditSessionEffect agent={agent} />
      <SettingsPageLayout
        title={title}
        icon={
          <AgentIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        links={getCoreAgentBreadcrumbLinks([{ children: title }])}
        actionButton={
          (isDirty || isSaving) &&
          !isFormDisabled && (
            <>
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => void discardCoreAgentChanges()}
              >{t`Discard settings`}</Button>
              <Button
                disabled={!canSave}
                loading={isSaving}
                onClick={() => void saveCoreAgentChanges()}
              >{t`Save settings`}</Button>
            </>
          )
        }
        secondaryBar={
          <SettingsTabBar
            aria-label={t`Agent settings`}
            tabs={tabs}
            componentInstanceId={tabListComponentId}
          />
        }
      >
        <SettingsPageContainer>
          <Section.Root>
            <StyledContentContainer>
              {isDefined(error ?? validationError) && (
                <div role="alert">{error ?? validationError}</div>
              )}
              {isDefined(session) && isRoleTab && (
                <CoreAgentRoleTab
                  key={resetVersion}
                  disabled={isFormDisabled}
                />
              )}
              {isDefined(session) && isSettingsTab && (
                <CoreAgentSettingsTab disabled={isFormDisabled} agent={agent} />
              )}
              {isDefined(session) && isTriggersTab && (
                <CoreAgentTriggersTab
                  key={resetVersion}
                  disabled={isFormDisabled}
                />
              )}
              {isRunsTab && <CoreAgentRunsTab agentId={agentId} />}
            </StyledContentContainer>
          </Section.Root>
        </SettingsPageContainer>
      </SettingsPageLayout>
    </>
  );
};
