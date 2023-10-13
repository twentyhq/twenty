import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { MainButton } from '@/ui/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { H2Title } from '@/ui/typography/components/H2Title';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
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

const validationSchema = Yup.object()
  .shape({
    name: Yup.string().required('Name can not be empty'),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export const CreateWorkspace = () => {
  const navigate = useNavigate();

  const { enqueueSnackBar } = useSnackBar();

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
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        const result = await updateWorkspace({
          variables: {
            data: {
              displayName: data.name,
            },
          },
          refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
          awaitRefetchQueries: true,
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
    [enqueueSnackBar, navigate, updateWorkspace],
  );

  useScopedHotkeys(
    'enter',
    () => {
      onSubmit(getValues());
    },
    PageHotkeyScope.CreateWokspace,
    [onSubmit],
  );

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
