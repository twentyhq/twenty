import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

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

const validationSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name can not be empty' }),
    lastName: z.string().min(1, { message: 'Last name can not be empty' }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const CreateProfile = () => {
  const navigate = useNavigate();

  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const { updateOneObject, objectNotFoundInMetadata } =
    useUpdateOneObjectRecord({
      objectNameSingular: 'workspaceMemberV2',
    });

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      firstName: currentWorkspaceMember?.firstName ?? '',
      lastName: currentWorkspaceMember?.lastName ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        if (!currentWorkspaceMember?.id) {
          throw new Error('User is not logged in');
        }
        if (!data.firstName || !data.lastName) {
          throw new Error('First name or last name is missing');
        }
        if (!updateOneObject || objectNotFoundInMetadata) {
          throw new Error('Object not found in metadata');
        }

        const result = await updateOneObject({
          idToUpdate: currentWorkspaceMember?.id,
          input: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        });

        if (result.errors || !result.data?.updateWorkspaceMemberV2) {
          throw result.errors ?? new Error('Unknown error');
        }

        setCurrentWorkspaceMember(
          (current) =>
            ({
              ...current,
              firstName: data.firstName,
              lastName: data.lastName,
            } as any),
        );

        navigate('/');
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: 'error',
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      enqueueSnackBar,
      navigate,
      objectNotFoundInMetadata,
      setCurrentWorkspaceMember,
      updateOneObject,
    ],
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
          {/* TODO: When react-web-hook-form is added to edit page we should create a dedicated component with context */}
          <StyledComboInputContainer>
            <Controller
              name="firstName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInput
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
                <TextInput
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
