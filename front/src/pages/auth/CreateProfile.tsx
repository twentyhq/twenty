import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import * as Yup from 'yup';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { MainButton } from '@/ui/button/components/MainButton';
import { TextInputSettings } from '@/ui/input/text/components/TextInputSettings';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { H2Title } from '@/ui/typography/components/H2Title';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { useUpdateUserMutation } from '~/generated/graphql';

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

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const validationSchema = Yup.object()
  .shape({
    firstName: Yup.string().required('First name can not be empty'),
    lastName: Yup.string().required('Last name can not be empty'),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export const CreateProfile = () => {
  const navigate = useNavigate();

  const { enqueueSnackBar } = useSnackBar();

  const [currentUser] = useRecoilState(currentUserState);

  const [updateUser] = useUpdateUserMutation();

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
    },
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        if (!currentUser?.id) {
          throw new Error('User is not logged in');
        }
        if (!data.firstName || !data.lastName) {
          throw new Error('First name or last name is missing');
        }

        const result = await updateUser({
          variables: {
            where: {
              id: currentUser?.id,
            },
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
          },
          refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
          awaitRefetchQueries: true,
        });

        if (result.errors || !result.data?.updateUser) {
          throw result.errors;
        }

        navigate('/');
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: 'error',
        });
      }
    },
    [currentUser?.id, enqueueSnackBar, navigate, updateUser],
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      onSubmit(getValues());
    },
    PageHotkeyScope.CreateProfile,
    [onSubmit],
  );

  return (
    <>
      <Title>Create profile</Title>
      <SubTitle>How you'll be identified on the app.</SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title="Picture" />
          <ProfilePictureUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title="Name"
            description="Your name as it will be displayed on the app"
          />
          {/* TODO: When react-hook-form is added to edit page we should create a dedicated component with context */}
          <StyledComboInputContainer>
            <Controller
              name="firstName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputSettings
                  autoFocus
                  label="First Name"
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder="Tim"
                  error={error?.message}
                  fullWidth
                  disableHotkeys
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputSettings
                  label="Last Name"
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder="Cook"
                  error={error?.message}
                  fullWidth
                  disableHotkeys
                />
              )}
            />
          </StyledComboInputContainer>
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
