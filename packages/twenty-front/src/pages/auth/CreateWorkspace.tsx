import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSetRecoilState } from 'recoil';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

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

const validationSchema = z
  .object({
    name: z.string().min(1, { message: 'Name can not be empty' }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const CreateWorkspace = () => {
  const navigate = useNavigate();

  const { enqueueSnackBar } = useSnackBar();
  const onboardingStatus = useOnboardingStatus();
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
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
        const result = await updateWorkspace({
          variables: {
            input: {
              displayName: data.name,
            },
          },
        });
        setCurrentWorkspace({
          id: result.data?.updateWorkspace?.id ?? '',
          displayName: data.name,
          subscriptionStatus:
            result.data?.updateWorkspace?.subscriptionStatus ?? 'incomplete',
          allowImpersonation:
            result.data?.updateWorkspace?.allowImpersonation ?? false,
        });

        if (result.errors || !result.data?.updateWorkspace) {
          throw result.errors ?? new Error('Unknown error');
        }

        setTimeout(() => {
          navigate('/create/profile');
        }, 20);
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: 'error',
        });
      }
    },
    [enqueueSnackBar, navigate, setCurrentWorkspace, updateWorkspace],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  useScopedHotkeys(
    'enter',
    () => {
      onSubmit(getValues());
    },
    PageHotkeyScope.CreateWokspace,
    [onSubmit],
  );

  if (onboardingStatus !== OnboardingStatus.OngoingWorkspaceCreation) {
    return null;
  }

  return (
    <>
      <Title>Create your workspace</Title>
      <SubTitle>
        A shared environment where you will be able to manage your customer
        relations with your team.
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title="Workspace logo" />
          <WorkspaceLogoUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title="Workspace name"
            description="The name of your organization"
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
                disableHotkeys
              />
            )}
          />
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title="Continue"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
};
