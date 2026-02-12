import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconList,
  IconListCheck,
  IconLock,
  IconSettings,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  type CreateAgentInput,
  useCreateOneAgentMutation,
  useFindOneAgentQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { SettingsAgentDetailSkeletonLoader } from './components/SettingsAgentDetailSkeletonLoader';
import { SettingsAgentEvalsTab } from './components/SettingsAgentEvalsTab';
import { SettingsAgentLogsTab } from './components/SettingsAgentLogsTab';
import { SettingsAgentRoleTab } from './components/SettingsAgentRoleTab';
import { SettingsAgentSettingsTab } from './components/SettingsAgentSettingsTab';
import { SETTINGS_AGENT_DETAIL_TABS } from './constants/SettingsAgentDetailTabs';
import { useSettingsAgentFormState } from './hooks/useSettingsAgentFormState';

const StyledContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledTabList = styled(TabList)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

export const SettingsAgentForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const { agentId = '' } = useParams<{ agentId: string }>();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isReadonlyMode, setIsReadonlyMode] = useState(false);
  const [originalFormValues, setOriginalFormValues] = useState<
    ReturnType<typeof useSettingsAgentFormState>['formValues'] | null
  >(null);

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const tabListComponentId = `${SETTINGS_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${agentId}`;
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const {
    formValues,
    isSubmitting,
    handleFieldChange,
    resetForm,
    setIsSubmitting,
    validateForm,
  } = useSettingsAgentFormState(mode);

  const { data, loading } = useFindOneAgentQuery({
    variables: { id: agentId },
    skip: isCreateMode || !agentId,
    onCompleted: (data) => {
      const agent = data?.findOneAgent;
      if (isDefined(agent)) {
        if (isDefined(agent.applicationId)) {
          setIsReadonlyMode(true);
        }
        const initialValues = {
          name: agent.name,
          label: agent.label,
          description: agent.description,
          icon: agent.icon || 'IconRobot',
          modelId: agent.modelId,
          role: agent.roleId,
          prompt: agent.prompt,
          isCustom: agent.isCustom,
          modelConfiguration: agent.modelConfiguration || {},
          responseFormat: agent.responseFormat || { type: 'text', schema: {} },
          evaluationInputs: agent.evaluationInputs || [],
        };
        resetForm(initialValues);
        setOriginalFormValues(initialValues);
      } else {
        enqueueErrorSnackBar({
          message: t`Agent not found`,
        });
        navigateApp(AppPath.NotFound);
      }
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
      navigateApp(AppPath.NotFound);
    },
  });

  const [createAgent] = useCreateOneAgentMutation();
  const [updateAgent] = useUpdateOneAgentMutation();

  const agent = data?.findOneAgent;

  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(formValues.role || ''),
  );
  const settingsPersistedRole = useRecoilValue(
    settingsPersistedRoleFamilyState(formValues.role || ''),
  );

  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId: formValues.role || '',
    isCreateMode: false,
  });

  const isRoleDirty =
    isDefined(formValues.role) &&
    !isDeeplyEqual(settingsDraftRole, settingsPersistedRole);

  const autoSave = useDebouncedCallback(async () => {
    if (
      isCreateMode ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting ||
      !agent
    ) {
      return;
    }

    const hasChanges =
      originalFormValues && !isDeeplyEqual(formValues, originalFormValues);

    if (!hasChanges && !isRoleDirty) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRoleDirty && isDefined(formValues.role)) {
        try {
          await saveDraftRoleToDB();
        } catch (error) {
          if (error instanceof ApolloError) {
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
          setIsSubmitting(false);
          return;
        }
      }

      await updateAgent({
        variables: {
          input: {
            id: agent.id,
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
          },
        },
      });

      setOriginalFormValues({ ...formValues });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  useEffect(() => {
    if (isEditMode && !loading && isDefined(originalFormValues)) {
      autoSave();
    }
  }, [
    formValues,
    isRoleDirty,
    isEditMode,
    loading,
    originalFormValues,
    autoSave,
  ]);

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);

  if (!isCreateMode && !loading && !agent) {
    return null;
  }

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
      Icon: IconList,
    },
  ];

  const handleSave = async () => {
    if (isReadonlyMode) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRoleDirty && isDefined(formValues.role)) {
        try {
          await saveDraftRoleToDB();
        } catch (error) {
          if (error instanceof ApolloError) {
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
          setIsSubmitting(false);
          return;
        }
      }

      if (isCreateMode) {
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

      if (!agent) {
        return;
      }

      await updateAgent({
        variables: {
          input: {
            id: agent.id,
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
          },
        },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();

    if (isRoleDirty && isDefined(settingsPersistedRole)) {
      setSettingsDraftRole(settingsPersistedRole);
    }

    navigate(SettingsPath.AI);
  };

  const title = !isCreateMode
    ? loading
      ? t`Agent`
      : agent?.label
    : t`New Agent`;
  const breadcrumbText = !isCreateMode
    ? loading
      ? t`Agent`
      : agent?.label
    : t`New Agent`;

  const isRoleTab = activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.ROLE;
  const isSettingsTab =
    activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS;
  const isEvalsTab = activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.EVALS;
  const isLogsTab = activeTabId === SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.LOGS;

  const isFormDisabled =
    isReadonlyMode || (isEditMode ? !agent?.isCustom : false);
  const isEvalsDisabled =
    process.env.NODE_ENV === 'development' ? isReadonlyMode : isFormDisabled;

  return (
    <>
      <SettingsRolesQueryEffect />
      <SubMenuTopBarContainer
        title={title}
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
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
          { children: breadcrumbText },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            {isEditMode && loading ? (
              <SettingsAgentDetailSkeletonLoader />
            ) : (
              <>
                <StyledTabList
                  tabs={tabs}
                  className="tab-list"
                  componentInstanceId={tabListComponentId}
                />
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
              </>
            )}
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
