import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  CreateAgentInput,
  useCreateOneAgentMutation,
  useFindOneAgentQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAgentDeleteConfirmationModal } from './components/SettingsAgentDeleteConfirmationModal';
import { SettingsAgentDetailSkeletonLoader } from './components/SettingsAgentDetailSkeletonLoader';
import { SettingsAgentHandoffSection } from './components/SettingsAgentHandoffSection';
import { SettingsAIAgentForm } from './forms/components/SettingsAIAgentForm';
import { useSettingsAgentFormState } from './hooks/useSettingsAgentFormState';

const StyledContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const DELETE_AGENT_MODAL_ID = 'delete-agent-modal';

export const SettingsAgentForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const { agentId = '' } = useParams<{ agentId: string }>();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const isEditMode = mode === 'edit';

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
    skip: !isEditMode || !agentId,
    onCompleted: (data) => {
      const agent = data?.findOneAgent;
      if (isDefined(agent)) {
        resetForm({
          name: agent.name,
          label: agent.label,
          description: agent.description,
          icon: agent.icon || 'IconRobot',
          modelId: agent.modelId,
          role: agent.roleId ?? undefined,
          prompt: agent.prompt,
          isCustom: agent.isCustom,
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

  const isAskAIAgent = agent?.id === currentWorkspace?.defaultAgent?.id;

  if (isEditMode && !loading && !agent) {
    return null;
  }

  const canSave = validateForm() && !isSubmitting;

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isEditMode) {
        const input: CreateAgentInput = {
          name: formValues.name,
          label: formValues.label,
          description: formValues.description,
          icon: formValues.icon,
          modelId: formValues.modelId,
          roleId: formValues.role || undefined,
          prompt: formValues.prompt,
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
            roleId: formValues.role || undefined,
            prompt: formValues.prompt,
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

  const title = isEditMode ? (loading ? t`Agent` : agent?.label) : t`New Agent`;
  const pageTitle = isEditMode ? t`Edit Agent` : t`New Agent`;
  const pageDescription = isEditMode
    ? t`Update agent information`
    : t`Create a new AI agent`;
  const breadcrumbText = isEditMode
    ? loading
      ? t`Agent`
      : agent?.label
    : t`New Agent`;

  return (
    <>
      <SubMenuTopBarContainer
        title={title}
        actionButton={
          !isEditMode || !isAskAIAgent ? (
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
            {!isAskAIAgent && (
              <H2Title title={pageTitle} description={pageDescription} />
            )}
            {isEditMode && loading ? (
              <SettingsAgentDetailSkeletonLoader />
            ) : (
              <StyledContentContainer>
                {isAskAIAgent ? (
                  <SettingsAgentHandoffSection agentId={agent?.id ?? ''} />
                ) : (
                  <>
                    <SettingsAIAgentForm
                      formValues={formValues}
                      onFieldChange={handleFieldChange}
                    />
                    {isEditMode && agent && formValues.isCustom && (
                      <Section>
                        <H2Title
                          title={t`Danger zone`}
                          description={t`Delete this agent`}
                        />
                        <Button
                          accent="danger"
                          variant="secondary"
                          title={t`Delete Agent`}
                          Icon={IconTrash}
                          onClick={() => openModal(DELETE_AGENT_MODAL_ID)}
                        />
                      </Section>
                    )}
                  </>
                )}
              </StyledContentContainer>
            )}
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      {isEditMode && agent && (
        <SettingsAgentDeleteConfirmationModal
          agentId={agent.id}
          agentName={agent.label}
        />
      )}
    </>
  );
};
