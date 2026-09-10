import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconListCheck,
  IconLock,
  IconSettings,
  IconTerminal,
  useIcons,
} from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  type CreateAgentInput,
  CreateOneAgentDocument,
  type FindOneAgentQuery,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsAgentEvalsTab } from '~/pages/settings/ai/components/SettingsAgentEvalsTab';
import { SettingsAgentLogsTab } from '~/pages/settings/ai/components/SettingsAgentLogsTab';
import { SettingsAgentRoleTab } from '~/pages/settings/ai/components/SettingsAgentRoleTab';
import { SettingsAgentSettingsTab } from '~/pages/settings/ai/components/SettingsAgentSettingsTab';
import { SETTINGS_AGENT_DETAIL_TABS } from '~/pages/settings/ai/constants/SettingsAgentDetailTabs';
import { useAutoSaveOnChange } from '~/pages/settings/ai/hooks/useAutoSaveOnChange';
import { useSettingsAgentFormState } from '~/pages/settings/ai/hooks/useSettingsAgentFormState';
import { getSettingsAgentInitialFormValues } from '~/pages/settings/ai/utils/getSettingsAgentInitialFormValues';
import { getSettingsAiBreadcrumbLinks } from '~/pages/settings/ai/utils/getSettingsAiBreadcrumbLinks';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const StyledContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

type SettingsAgentFormContentProps = {
  agent?: FindOneAgentQuery['findOneAgent'];
};

export const SettingsAgentFormContent = ({
  agent,
}: SettingsAgentFormContentProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isCreateMode = !isDefined(agent);
  const isEditMode = isDefined(agent);
  // Agents created in the workspace belong to its own application; only an
  // installed application's agents are managed elsewhere.
  const isReadonlyMode =
    isDefined(agent?.applicationId) &&
    agent.applicationId !== currentWorkspace?.workspaceCustomApplication?.id;
  const agentId = agent?.id ?? '';

  const [initialFormValues] = useState(() =>
    getSettingsAgentInitialFormValues(agent),
  );
  const [originalFormValues, setOriginalFormValues] =
    useState(initialFormValues);

  const tabListComponentId = `${SETTINGS_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${agentId}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const {
    formValues,
    isSubmitting,
    handleFieldChange,
    setIsSubmitting,
    validateForm,
  } = useSettingsAgentFormState(initialFormValues);

  const [createAgent] = useMutation(CreateOneAgentDocument);
  const [updateAgent] = useMutation(UpdateOneAgentDocument);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    formValues.role || '',
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    formValues.role || '',
  );
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    formValues.role || '',
  );

  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId: formValues.role || '',
    isCreateMode: false,
  });

  const isRoleDirty =
    isDefined(formValues.role) &&
    !isDeeplyEqual(settingsDraftRole, settingsPersistedRole);

  const saveDraftRole = async (): Promise<boolean> => {
    try {
      await saveDraftRoleToDB();

      return true;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueErrorSnackBar({
          apolloError: error,
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        enqueueErrorSnackBar({
          message: t`Failed to save role permissions: ${errorMessage}`,
        });
      }

      return false;
    }
  };

  const buildUpdateInput = (agentIdToUpdate: string) => ({
    id: agentIdToUpdate,
    name: formValues.name || '',
    label: formValues.label,
    description: formValues.description,
    icon: formValues.icon,
    modelId: formValues.modelId,
    roleId: formValues.role,
    prompt: formValues.prompt,
    modelConfiguration: formValues.modelConfiguration,
    responseFormat: formValues.responseFormat,
    evaluationInputs: formValues.evaluationInputs,
  });

  const autoSave = useDebouncedCallback(async () => {
    if (
      !isDefined(agent) ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting
    ) {
      return;
    }

    const hasChanges = !isDeeplyEqual(formValues, originalFormValues);

    if (!hasChanges && !isRoleDirty) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRoleDirty && isDefined(formValues.role)) {
        const isRoleSaved = await saveDraftRole();

        if (!isRoleSaved) {
          setIsSubmitting(false);
          return;
        }
      }

      await updateAgent({
        variables: { input: buildUpdateInput(agent.id) },
      });

      setOriginalFormValues({ ...formValues });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  useAutoSaveOnChange({
    autoSave,
    isEnabled: isEditMode,
    watchedValue: formValues,
  });
  useAutoSaveOnChange({
    autoSave,
    isEnabled: isEditMode,
    watchedValue: isRoleDirty,
  });

  const canSave = !isReadonlyMode && validateForm() && !isSubmitting;

  const tabs = [
    {
      id: SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    },
    {
      id: SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.ROLE,
      title: t`Role`,
      Icon: IconLock,
    },
    {
      id: SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.EVALS,
      title: t`Evals`,
      Icon: IconListCheck,
    },
    {
      id: SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.LOGS,
      title: t`Logs`,
      Icon: IconTerminal,
    },
  ];

  const handleSave = async () => {
    if (isReadonlyMode || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRoleDirty && isDefined(formValues.role)) {
        const isRoleSaved = await saveDraftRole();

        if (!isRoleSaved) {
          setIsSubmitting(false);
          return;
        }
      }

      if (!isDefined(agent)) {
        const input: CreateAgentInput = {
          name: formValues.name,
          label: formValues.label,
          description: formValues.description,
          icon: formValues.icon,
          modelId: formValues.modelId,
          roleId: formValues.role,
          prompt: formValues.prompt,
          modelConfiguration: formValues.modelConfiguration,
          responseFormat: formValues.responseFormat,
          evaluationInputs: formValues.evaluationInputs,
        };

        await createAgent({
          variables: { input },
        });
        navigate(SettingsPath.AI);
        return;
      }

      await updateAgent({
        variables: { input: buildUpdateInput(agent.id) },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isRoleDirty && isDefined(settingsPersistedRole)) {
      setSettingsDraftRole(settingsPersistedRole);
    }

    navigate(SettingsPath.AI);
  };

  const title = isDefined(agent) ? agent.label : t`New Agent`;
  const AgentIcon = getIcon(formValues.icon || 'IconLego');

  const isRoleTab = activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.ROLE;
  const isSettingsTab =
    activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS;
  const isEvalsTab = activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.EVALS;
  const isLogsTab = activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.LOGS;

  const isFormDisabled =
    isReadonlyMode || (isDefined(agent) ? !agent.isCustom : false);
  const isEvalsDisabled =
    process.env.NODE_ENV === 'development' ? isReadonlyMode : isFormDisabled;

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsPageLayout
        title={title}
        icon={
          <AgentIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        actionButton={
          isCreateMode ? (
            <SaveAndCancelButtons
              onSave={handleSave}
              onCancel={handleCancel}
              isSaveDisabled={!canSave}
              isLoading={isSubmitting}
              isCancelDisabled={isSubmitting}
            />
          ) : undefined
        }
        links={getSettingsAiBreadcrumbLinks(title)}
        secondaryBar={
          <SettingsTabBar
            tabs={tabs}
            componentInstanceId={tabListComponentId}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <StyledContentContainer>
              {isRoleTab && (
                <SettingsAgentRoleTab
                  formValues={formValues}
                  onFieldChange={handleFieldChange}
                  disabled={isFormDisabled}
                  agentId={agentId}
                  agentLabel={formValues.label}
                />
              )}
              {isSettingsTab && (
                <SettingsAgentSettingsTab
                  formValues={formValues}
                  onFieldChange={handleFieldChange}
                  disabled={isFormDisabled}
                  agent={agent}
                />
              )}
              {isEvalsTab && (
                <SettingsAgentEvalsTab
                  agentId={agentId}
                  evaluationInputs={formValues.evaluationInputs}
                  onEvaluationInputsChange={(inputs) =>
                    handleFieldChange('evaluationInputs', inputs)
                  }
                  disabled={isEvalsDisabled}
                />
              )}
              {isLogsTab && <SettingsAgentLogsTab agentId={agentId} />}
            </StyledContentContainer>
          </Section>
        </SettingsPageContainer>
      </SettingsPageLayout>
    </>
  );
};
