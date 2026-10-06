import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import {
  IconBolt,
  IconLock,
  IconSettings,
  IconTerminal,
  useIcons,
} from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type FindOneAgentQuery } from '~/generated-metadata/graphql';
import { CoreAgentRoleTab } from '@/object-core/agents/components/CoreAgentRoleTab';
import { CoreAgentRunsTab } from '@/object-core/agents/components/CoreAgentRunsTab';
import { CoreAgentSettingsTab } from '@/object-core/agents/components/CoreAgentSettingsTab';
import { CoreAgentTriggersTab } from '@/object-core/agents/components/CoreAgentTriggersTab';
import { CORE_AGENT_DETAIL_TABS } from '@/object-core/agents/constants/CoreAgentDetailTabs';
import { useCoreAgentFormState } from '@/object-core/agents/hooks/useCoreAgentFormState';
import { useCoreAgentSave } from '@/object-core/agents/hooks/useCoreAgentSave';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { getCoreAgentInitialFormValues } from '@/object-core/agents/utils/getCoreAgentInitialFormValues';
import { isOwnedByInstalledApplication } from '@/applications/utils/isOwnedByInstalledApplication';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isReadonlyMode = isOwnedByInstalledApplication({
    applicationId: agent.applicationId,
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });
  const agentId = agent.id;

  const [initialFormValues] = useState(() =>
    getCoreAgentInitialFormValues(agent),
  );

  const tabListComponentId = `${CORE_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${agentId}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const { formValues, setFieldValue, validateForm } =
    useCoreAgentFormState(initialFormValues);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    formValues.role || '',
  );
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    formValues.role || '',
  );

  const isRoleDirty =
    isDefined(formValues.role) &&
    !isDeeplyEqual(settingsDraftRole, settingsPersistedRole);

  const { scheduleAutoSave } = useCoreAgentSave({
    agent,
    formValues,
    initialFormValues,
    isReadonlyMode,
    isRoleDirty,
    validateForm,
  });

  const handleFieldChange = (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => {
    setFieldValue(field, value);
    scheduleAutoSave();
  };

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
  ];

  const title = agent.label;
  const AgentIcon = getIcon(formValues.icon || 'IconLego');

  const isRoleTab = activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.ROLE;
  const isSettingsTab =
    activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS;
  const isTriggersTab =
    activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.TRIGGERS;
  const isRunsTab = activeTabId === CORE_AGENT_DETAIL_TABS.TABS_IDS.RUNS;

  const isFormDisabled = isReadonlyMode || !agent.isCustom;

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsPageLayout
        title={title}
        icon={
          <AgentIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        links={getCoreAgentBreadcrumbLinks([{ children: title }])}
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
              {isRoleTab && (
                <CoreAgentRoleTab
                  formValues={formValues}
                  onFieldChange={handleFieldChange}
                  disabled={isFormDisabled}
                  agentId={agentId}
                  agentLabel={formValues.label}
                />
              )}
              {isSettingsTab && (
                <CoreAgentSettingsTab
                  formValues={formValues}
                  onFieldChange={handleFieldChange}
                  disabled={isFormDisabled}
                  agent={agent}
                />
              )}
              {isTriggersTab && (
                <CoreAgentTriggersTab
                  triggers={formValues.triggers}
                  onTriggersChange={(triggers) =>
                    handleFieldChange('triggers', triggers)
                  }
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
