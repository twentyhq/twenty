import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  Controller,
  type SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { OnboardingV2Frame } from '@/onboarding/components/OnboardingV2Frame';
import {
  PendingCreationLoaderStep,
  useActivateWorkspaceOnboarding,
} from '@/onboarding/hooks/useActivateWorkspaceOnboarding';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui-deprecated/feedback';
import { MainButton } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledPendingPage = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-top: 120px;
  width: 100%;
`;

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[14]};
`;

const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledPendingCreation = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 340px;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const computeSubdomainFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const CreateWorkspaceV2 = () => {
  const { t } = useLingui();
  const { pendingCreationLoaderStep, activateWorkspace } =
    useActivateWorkspaceOnboarding();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const domainConfiguration = useAtomStateValue(domainConfigurationState);

  const validationSchema = z
    .object({
      name: z.string().min(1, { message: t`Name can not be empty` }),
    })
    .required();

  type Form = z.infer<typeof validationSchema>;

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

  const nameValue = useWatch({ control, name: 'name' });
  const subdomainValue = computeSubdomainFromName(nameValue ?? '');

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

  if (pendingCreationLoaderStep !== PendingCreationLoaderStep.None) {
    return (
      <StyledPendingPage>
        <StyledPendingCreation>
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
          <StyledLoaderContainer>
            <Loader color="gray" />
          </StyledLoaderContainer>
        </StyledPendingCreation>
      </StyledPendingPage>
    );
  }

  return (
    <OnboardingV2Frame
      activeStep={0}
      title={<Trans>Create your workspace</Trans>}
      subtitle={<Trans>Move work forward across teams and agents</Trans>}
    >
      <StyledForm>
        <WorkspaceLogoUploader />
        <StyledFieldGroup>
          <StyledLabel>
            <Trans>Name</Trans>
          </StyledLabel>
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
        </StyledFieldGroup>
        <StyledFieldGroup>
          <StyledLabel>
            <Trans>Subdomain</Trans>
          </StyledLabel>
          <TextInput
            value={subdomainValue}
            placeholder={t`apple`}
            rightAdornment={
              isDefined(domainConfiguration.frontDomain)
                ? `.${domainConfiguration.frontDomain}`
                : undefined
            }
            readOnly
            fullWidth
          />
        </StyledFieldGroup>
      </StyledForm>

      <StyledButtonContainer>
        <MainButton
          title={t`Create workspace`}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          Icon={() => isSubmitting && <Loader />}
          fullWidth
        />
      </StyledButtonContainer>
    </OnboardingV2Frame>
  );
};
