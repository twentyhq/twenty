import { styled } from '@linaria/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { ModalContent } from 'twenty-ui/layout';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { ActivateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 200px;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

enum PendingCreationLoaderStep {
  None = 'none',
  Step1 = 'step-1',
  Step2 = 'step-2',
  Step3 = 'step-3',
}

const StyledPendingCreationLoader = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const CreateWorkspace = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();

  const { loadCurrentUser } = useLoadCurrentUser();
  const [activateWorkspace] = useMutation(ActivateWorkspaceDocument);
  const [pendingCreationLoaderStep, setPendingCreationLoaderStep] = useState(
    PendingCreationLoaderStep.None,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

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

        if (isDefined(result.error)) {
          throw result.error ?? new Error(t`Unknown error`);
        }

        await refreshObjectMetadataItems();
        await loadCurrentUser();
        setNextOnboardingStatus();
      } catch (error: any) {
        setPendingCreationLoaderStep(PendingCreationLoaderStep.None);

        enqueueErrorSnackBar({
          apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
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
    <ModalContent isVerticallyCentered isHorizontallyCentered>
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
                    placeholder={t`Apple`}
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
    </ModalContent>
  );
};
