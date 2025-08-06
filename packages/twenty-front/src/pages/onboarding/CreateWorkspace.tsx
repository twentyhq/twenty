import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ApolloError } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { useActivateWorkspaceMutation } from '~/generated-metadata/graphql';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

enum PendingCreationLoaderStep {
  None = 'none',
  Step1 = 'step-1',
  Step2 = 'step-2',
  Step3 = 'step-3',
}

const StyledPendingCreationLoader = styled(motion.div)`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CreateWorkspace = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();

  const { loadCurrentUser } = useAuth();
  const [activateWorkspace] = useActivateWorkspaceMutation();
  const [pendingCreationLoaderStep, setPendingCreationLoaderStep] = useState(
    PendingCreationLoaderStep.None,
  );
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const validationSchema = z
    .object({
      name: z.string().min(1, { message: t`Name can not be empty` }),
    })
    .required();

  type Form = z.infer<typeof validationSchema>;

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        setTimeout(() => {
          setPendingCreationLoaderStep(PendingCreationLoaderStep.Step1);
        }, 500);
        setTimeout(() => {
          setPendingCreationLoaderStep(PendingCreationLoaderStep.Step2);
        }, 2000);
        setTimeout(() => {
          setPendingCreationLoaderStep(PendingCreationLoaderStep.Step3);
        }, 5000);

        const result = await activateWorkspace({
          variables: {
            input: {
              displayName: data.name,
            },
          },
        });

        if (isDefined(result.errors)) {
          throw result.errors ?? new Error(t`Unknown error`);
        }

        await refreshObjectMetadataItems();
        await loadCurrentUser();
        setNextOnboardingStatus();
      } catch (error: any) {
        setPendingCreationLoaderStep(PendingCreationLoaderStep.None);

        enqueueErrorSnackBar({
          apolloError: error instanceof ApolloError ? error : undefined,
        });
      }
    },
    [
      activateWorkspace,
      enqueueErrorSnackBar,
      loadCurrentUser,
      refreshObjectMetadataItems,
      setNextOnboardingStatus,
      t,
    ],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      {pendingCreationLoaderStep !== PendingCreationLoaderStep.None && (
        <>
          <Logo
            primaryLogo={
              isNonEmptyString(currentWorkspace?.logo)
                ? currentWorkspace?.logo
                : undefined
            }
          />
          <Title>
            <Trans>Creating your workspace</Trans>
          </Title>
          <StyledPendingCreationLoader>
            {pendingCreationLoaderStep === PendingCreationLoaderStep.Step1 && (
              <SubTitle>
                <Trans>Setting up your database...</Trans>
              </SubTitle>
            )}
            {pendingCreationLoaderStep === PendingCreationLoaderStep.Step2 && (
              <SubTitle>
                <Trans>Creating your data model...</Trans>
              </SubTitle>
            )}
            {pendingCreationLoaderStep === PendingCreationLoaderStep.Step3 && (
              <SubTitle>
                <Trans>Prefilling your workspace data...</Trans>
              </SubTitle>
            )}
          </StyledPendingCreationLoader>
          <StyledLoaderContainer>
            <Loader color="gray" />
          </StyledLoaderContainer>
        </>
      )}
      {pendingCreationLoaderStep === PendingCreationLoaderStep.None && (
        <>
          <Title noMarginTop>
            <Trans>Create your workspace</Trans>
          </Title>
          <SubTitle>
            <Trans>
              A shared environment where you will be able to manage your
              customer relations with your team.
            </Trans>
          </SubTitle>

          <StyledContentContainer>
            <StyledSectionContainer>
              <H2Title title={t`Workspace logo`} />
              <WorkspaceLogoUploader />
            </StyledSectionContainer>
            <StyledSectionContainer>
              <H2Title
                title={t`Workspace name`}
                description={t`The name of your organization`}
              />
              <Controller
                name="name"
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <TextInput
                    autoFocus
                    value={value}
                    placeholder="Apple"
                    onBlur={onBlur}
                    onChange={onChange}
                    error={error?.message}
                    onKeyDown={handleKeyDown}
                    fullWidth
                  />
                )}
              />
            </StyledSectionContainer>
          </StyledContentContainer>
          <StyledButtonContainer>
            <MainButton
              title={t`Continue`}
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
              Icon={() => isSubmitting && <Loader />}
              fullWidth
            />
          </StyledButtonContainer>
        </>
      )}
    </Modal.Content>
  );
};
