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

export const SettingsAgentDetail = () => {
  const { t } = useLingui();
  const { agentId = '' } = useParams<{ agentId: string }>();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();

  const formConfig = useForm<SettingsAIAgentFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsAIAgentFormSchema),
    defaultValues: {
      name: '',
      label: '',
      description: '',
      icon: 'IconRobot',
      modelId: '',
      role: '',
      prompt: '',
      isCustom: true,
    },
  });

  const { data, loading } = useFindOneAgentQuery({
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      const agent = data?.findOneAgent;
      if (isDefined(agent)) {
        formConfig.reset({
          name: agent.name,
          label: agent.label,
          description: agent.description,
          icon: agent.icon || 'IconRobot',
          modelId: agent.modelId,
          role: agent.roleId,
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

  const [updateAgent] = useUpdateOneAgentMutation();

  const agent = data?.findOneAgent;

  const { isValid, isSubmitting } = formConfig.formState;

  const handleSave = async (formData: SettingsAIAgentFormValues) => {
    if (!agent) {
      return;
    }

    try {
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

  if (!loading && !agent) {
    return <></>;
  }

  const agentName = agent ? agent.name : t`Agent`;

  return (
    <SubMenuTopBarContainer
      title={agentName}
      actionButton={
        !loading && (
          <SaveAndCancelButtons
            onSave={formConfig.handleSubmit(handleSave)}
            onCancel={() => navigate(SettingsPath.AI)}
            isSaveDisabled={!isValid || isSubmitting}
            isCancelDisabled={isSubmitting}
            isLoading={isSubmitting}
          />
        )
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: agentName },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Edit Agent`}
            description={t`Update agent information`}
          />
          {loading ? (
            <SettingsAgentDetailSkeletonLoader />
          ) : (
            <StyledContentContainer>
              <FormProvider
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...formConfig}
              >
                <SettingsAIAgentForm />
              </FormProvider>
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
            </StyledContentContainer>
          )}
        </Section>
      </SettingsPageContainer>
      <SettingsAgentDeleteConfirmationModal
        agentId={agent?.id}
        agentName={agent?.name as string}
      />
    </SubMenuTopBarContainer>
  );
};
