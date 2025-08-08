import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { PageFocusId } from '@/types/PageFocusId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { ApolloError } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';

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
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
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

        setCurrentWorkspaceMember((current) => {
          if (isDefined(current)) {
            return {
              ...current,
              name: {
                firstName: data.firstName,
                lastName: data.lastName,
              },
              colorScheme: 'System',
            };
          }
          return current;
        });

        setCurrentUser((current) => {
          if (isDefined(current)) {
            return {
              ...current,
              firstName: data.firstName,
              lastName: data.lastName,
            };
          }
          return current;
        });

        setNextOnboardingStatus();
      } catch (error: any) {
        enqueueErrorSnackBar({
          apolloError: error instanceof ApolloError ? error : undefined,
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      setNextOnboardingStatus,
      enqueueErrorSnackBar,
      setCurrentWorkspaceMember,
      setCurrentUser,
      updateOneRecord,
    ],
  );

  const [isEditingMode, setIsEditingMode] = useState(false);

  const handleEnter = () => {
    if (isEditingMode) {
      onSubmit(getValues());
    }
  };

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: handleEnter,
    focusId: PageFocusId.CreateProfile,
    dependencies: [handleEnter],
  });

  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <Title noMarginTop>
        <Trans>Create profile</Trans>
      </Title>
      <SubTitle>
        <Trans>How you'll be identified on the app.</Trans>
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title="Picture" />
          <ProfilePictureUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title={t`Name`}
            description={t`Your name as it will be displayed on the app`}
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
                  label={t`First Name`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
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
                  label={t`Last Name`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
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
          title={t`Continue`}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          fullWidth
        />
      </StyledButtonContainer>
    </Modal.Content>
  );
};
