import { styled } from '@linaria/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  PendingCreationLoaderStep,
  useActivateWorkspaceOnboarding,
} from '@/onboarding/hooks/useActivateWorkspaceOnboarding';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { TextInput } from '@/ui/input/components/TextInput';
import { ModalContent } from 'twenty-ui-deprecated/layout';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { isOnboardingV2EnabledState } from '@/client-config/states/isOnboardingV2EnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { H2Title } from 'twenty-ui-deprecated/display';
import { Loader } from 'twenty-ui-deprecated/feedback';
import { MainButton } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { CreateWorkspaceV2 } from './CreateWorkspaceV2';

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

const StyledPendingCreationLoader = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const CreateWorkspaceV1 = () => {
  const { t } = useLingui();
  const { pendingCreationLoaderStep, activateWorkspace } =
    useActivateWorkspaceOnboarding();
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

  const onSubmit: SubmitHandler<Form> = async (data) => {
    await activateWorkspace({ displayName: data.name });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }
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

export const CreateWorkspace = () => {
  const isOnboardingV2Enabled = useAtomStateValue(isOnboardingV2EnabledState);

  return isOnboardingV2Enabled ? <CreateWorkspaceV2 /> : <CreateWorkspaceV1 />;
};
