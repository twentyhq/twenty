import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
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
import { SettingsAIAgentForm } from './forms/components/SettingsAIAgentForm';
import {
  settingsAIAgentFormSchema,
  SettingsAIAgentFormValues,
} from './validation-schemas/settingsAIAgentFormSchema';

const StyledContentContainer = styled.div`
  flex: 1;
  width: 100%;
  padding-left: 0;
`;

const StyledDangerZoneSection = styled(Section)`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const DELETE_AGENT_MODAL_ID = 'delete-agent-modal';

type SettingsAgentFormMode = 'create' | 'edit';

interface SettingsAgentFormProps {
  mode: SettingsAgentFormMode;
}

export const SettingsAgentForm = ({ mode }: SettingsAgentFormProps) => {
  const { t } = useLingui();
  const { agentId = '' } = useParams<{ agentId: string }>();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();

  const isEditMode = mode === 'edit';

  const formConfig = useForm<SettingsAIAgentFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsAIAgentFormSchema),
    defaultValues: {
      name: '',
      label: '',
      description: '',
      icon: 'IconRobot',
      modelId: isEditMode ? '' : 'auto',
      role: '',
      prompt: '',
      isCustom: true,
    },
  });

  const { data, loading } = useFindOneAgentQuery({
    variables: { id: agentId },
    skip: !isEditMode || !agentId,
    onCompleted: (data) => {
      const agent = data?.findOneAgent;
      if (isDefined(agent)) {
        formConfig.reset({
          name: agent.name,
          label: agent.label,
          description: agent.description,
          icon: agent.icon || 'IconRobot',
          modelId: agent.modelId,
          role: agent.roleId || '',
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

  if (isEditMode && !loading && !agent) {
    return <></>;
  }

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (formData: SettingsAIAgentFormValues) => {
    try {
      if (!isEditMode) {
        const input: CreateAgentInput = {
          name: formData.name,
          label: formData.label,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          modelId: formData.modelId,
          roleId: formData.role || undefined,
          prompt: formData.prompt,
          isCustom: formData.isCustom,
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
            name: formData.name,
            label: formData.label,
            description: formData.description,
            icon: formData.icon,
            modelId: formData.modelId,
            roleId: formData.role || null,
            prompt: formData.prompt,
            isCustom: formData.isCustom,
          },
        },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    }
  };

  const title = isEditMode ? (loading ? t`Agent` : agent?.name) : t`New Agent`;
  const pageTitle = isEditMode ? t`Edit Agent` : t`New Agent`;
  const pageDescription = isEditMode
    ? t`Update agent information`
    : t`Create a new AI agent`;
  const breadcrumbText = isEditMode
    ? loading
      ? t`Agent`
      : agent?.name
    : t`New Agent`;

  return (
    <>
      <SubMenuTopBarContainer
        title={title}
        actionButton={
          <SaveAndCancelButtons
            onSave={formConfig.handleSubmit(handleSave)}
            onCancel={() => navigate(SettingsPath.AI)}
            isSaveDisabled={!canSave}
            isLoading={isSubmitting}
            isCancelDisabled={isSubmitting}
          />
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
              <StyledContentContainer>
                <FormProvider
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...formConfig}
                >
                  <SettingsAIAgentForm />
                </FormProvider>
                {isEditMode && agent && (
                  <StyledDangerZoneSection>
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
                  </StyledDangerZoneSection>
                )}
              </StyledContentContainer>
            )}
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      {isEditMode && agent && (
        <SettingsAgentDeleteConfirmationModal
          agentId={agent.id}
          agentName={agent.name}
        />
      )}
    </>
  );
};
