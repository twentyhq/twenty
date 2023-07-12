import { useCallback, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { GET_CURRENT_USER } from '@/users/queries';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

const StyledContentContainer = styled.div`
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledSectionContainer = styled.div`
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

const StyledErrorContainer = styled.div`
  color: ${({ theme }) => theme.color.red};
`;

const validationSchema = Yup.object()
  .shape({
    name: Yup.string().required(),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export function CreateWorkspace() {
  const navigate = useNavigate();
  const onboardingStatus = useOnboardingStatus();

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    setError,
    getValues,
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        const result = await updateWorkspace({
          variables: {
            data: {
              displayName: {
                set: data.name,
              },
            },
          },
          refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
          awaitRefetchQueries: true,
        });

        if (result.errors || !result.data?.updateWorkspace) {
          throw result.errors ?? new Error('Unknown error');
        }

        navigate('/auth/create/profile');
      } catch (error: any) {
        setError('root', { message: error?.message });
      }
    },
    [navigate, setError, updateWorkspace],
  );

  useScopedHotkeys(
    'enter',
    () => {
      onSubmit(getValues());
    },
    InternalHotkeysScope.CreateWokspace,
    [onSubmit],
  );

  useEffect(() => {
    if (onboardingStatus !== OnboardingStatus.OngoingWorkspaceCreation) {
      navigate('/auth/create/profile');
    }
  }, [onboardingStatus, navigate]);

  return (
    <>
      <Title>Create your workspace</Title>
      <SubTitle>
        A shared environment where you will be able to manage your customer
        relations with your team.
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <SubSectionTitle title="Workspace logo" />
          {/* Picture is actually uploaded on the fly */}
          <WorkspaceLogoUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
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
                value={value}
                placeholder="Apple"
                onBlur={onBlur}
                onChange={onChange}
                error={error?.message}
                fullWidth
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
      {/* Will be replaced by error snack bar */}
      <Controller
        name="name"
        control={control}
        render={({ formState: { errors } }) => (
          <StyledErrorContainer>{errors?.root?.message}</StyledErrorContainer>
        )}
      />
    </>
  );
}
