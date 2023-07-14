import { useCallback, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import * as Yup from 'yup';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { useSnackBar } from '@/snack-bar/hooks/useSnackBar';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { GET_CURRENT_USER } from '@/users/queries';
import { useUpdateUserMutation } from '~/generated/graphql';
import { PageHotkeysScope } from '~/sync-hooks/types/PageHotkeysScope';

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

export function CreateProfile() {
  const navigate = useNavigate();
  const onboardingStatus = useOnboardingStatus();

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
              firstName: {
                set: data.firstName,
              },
              lastName: {
                set: data.lastName,
              },
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
    PageHotkeysScope.CreateProfile,
    [onSubmit],
  );

  useEffect(() => {
    if (onboardingStatus !== OnboardingStatus.OngoingProfileCreation) {
      navigate('/');
    }
  }, [onboardingStatus, navigate]);

  return (
    <>
      <Title>Create profile</Title>
      <SubTitle>How you'll be identified on the app.</SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <SubSectionTitle title="Picture" />
          <ProfilePictureUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
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
                <TextInput
                  label="First Name"
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder="Tim"
                  error={error?.message}
                  fullWidth
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
                <TextInput
                  label="Last Name"
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder="Cook"
                  error={error?.message}
                  fullWidth
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
}
