import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title, IconLock, IconSettings } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  type CreateAgentInput,
  useCreateOneAgentMutation,
  useFindOneAgentQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { useState } from 'react';
import { SettingsAgentDetailSkeletonLoader } from './components/SettingsAgentDetailSkeletonLoader';
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
        resetForm({
          name: agent.name,
          label: agent.label,
          description: agent.description,
          icon: agent.icon || 'IconRobot',
          modelId: agent.modelId,
          role: agent.roleId,
          prompt: agent.prompt,
          isCustom: agent.isCustom,
          modelConfiguration: agent.modelConfiguration || {},
        });
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

  const title = !isCreateMode
    ? loading
      ? t`Agent`
      : agent?.label
    : t`New Agent`;
  const pageTitle = !isCreateMode ? t`Edit Agent` : t`New Agent`;
  const pageDescription = !isCreateMode
    ? t`Update agent information`
    : t`Create a new AI agent`;
  const breadcrumbText = !isCreateMode
    ? loading
      ? t`Agent`
      : agent?.label
    : t`New Agent`;

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.ROLE:
        return (
          <SettingsAgentRoleTab
            formValues={formValues}
            onFieldChange={handleFieldChange}
            disabled={isReadonlyMode || (isEditMode ? !agent?.isCustom : false)}
          />
        );

      case SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS:
        return (
          <SettingsAgentSettingsTab
            formValues={formValues}
            onFieldChange={handleFieldChange}
            disabled={isReadonlyMode || (isEditMode ? !agent?.isCustom : false)}
            agent={agent}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      <SubMenuTopBarContainer
        title={title}
        actionButton={
          isCreateMode || (isEditMode && agent?.isCustom) ? (
            <SaveAndCancelButtons
              onSave={handleSave}
              onCancel={() => navigate(SettingsPath.AI)}
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
            <H2Title title={pageTitle} description={pageDescription} />
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
                  {renderActiveTabContent()}
                </StyledContentContainer>
              </>
            )}
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
