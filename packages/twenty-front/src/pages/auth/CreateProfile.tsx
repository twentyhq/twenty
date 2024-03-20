import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

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
  const onboardingStatus = useOnboardingStatus();

  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
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
      firstName: currentWorkspaceMember?.name?.firstName ?? '',
      lastName: currentWorkspaceMember?.name?.lastName ?? '',
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

        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          updateOneRecordInput: {
            name: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
            colorScheme: 'System',
          },
        });

        setCurrentWorkspaceMember(
          (current) =>
            ({
              ...current,
              name: {
                firstName: data.firstName,
                lastName: data.lastName,
              },
              colorScheme: 'System',
            }) as any,
        );
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: 'error',
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      enqueueSnackBar,
      setCurrentWorkspaceMember,
      updateOneRecord,
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

  if (onboardingStatus !== OnboardingStatus.OngoingProfileCreation) {
    return null;
  }

  return (
    <>
      <Title withMarginTop={false}>Create profile</Title>
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
