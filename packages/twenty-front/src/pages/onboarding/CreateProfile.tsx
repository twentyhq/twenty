import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { OnboardingProfilePictureUploader } from '@/onboarding/components/OnboardingProfilePictureUploader';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { usePrefetchInviteSuggestions } from '@/onboarding/hooks/usePrefetchInviteSuggestions';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { PageFocusId } from '@/types/PageFocusId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { z } from 'zod';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  max-width: 100%;
  padding-bottom: ${themeCssVariables.spacing[4]};
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledNameRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const StyledNameField = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const firstNameErrorMessage = msg`First name can not be empty`;
const lastNameErrorMessage = msg`Last name can not be empty`;

const validationSchema = z.object({
  firstName: z.string().min(1, {
    error: i18n._(firstNameErrorMessage),
  }),
  lastName: z.string().min(1, {
    error: i18n._(lastNameErrorMessage),
  }),
  jobTitle: z.string(),
});

type Form = z.infer<typeof validationSchema>;

export const CreateProfile = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();

  usePrefetchInviteSuggestions();

  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setCurrentUser = useSetAtomState(currentUserState);
  const setCurrentWorkspaceMembers = useSetAtomState(
    currentWorkspaceMembersState,
  );
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  const [isNavigating, setIsNavigating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      firstName: currentWorkspaceMember?.name?.firstName ?? '',
      lastName: currentWorkspaceMember?.name?.lastName ?? '',
      jobTitle: currentWorkspaceMember?.jobTitle ?? '',
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

        await updateWorkspaceMemberSettings({
          workspaceMemberId: currentWorkspaceMember.id,
          update: {
            name: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
            jobTitle: data.jobTitle,
            colorScheme: 'System',
          },
        });

        setCurrentWorkspaceMembers((members) =>
          members.map((member) =>
            member.id === currentWorkspaceMember?.id
              ? {
                  ...member,
                  name: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                  },
                  jobTitle: data.jobTitle,
                  colorScheme: 'System',
                }
              : member,
          ),
        );

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
        setIsNavigating(true);
      } catch (error: any) {
        setIsNavigating(false);
        enqueueErrorSnackBar({
          apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      setNextOnboardingStatus,
      enqueueErrorSnackBar,
      setCurrentWorkspaceMembers,
      setCurrentUser,
      updateWorkspaceMemberSettings,
    ],
  );

  const [isEditingMode, setIsEditingMode] = useState(false);

  const handleEnter = () => {
    if (isEditingMode) {
      handleSubmit(onSubmit)();
    }
  };

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: handleEnter,
    focusId: PageFocusId.CreateProfile,
    dependencies: [handleEnter],
  });

  return (
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Create profile`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {t`How you'll appear to teammates and agents.`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      <OnboardingStepAnimatedItem index={2}>
        <StyledForm>
          <StyledNameRow>
            {isDefined(currentWorkspaceMember?.id) && (
              <OnboardingProfilePictureUploader
                workspaceMemberId={currentWorkspaceMember.id}
              />
            )}
            <StyledNameField>
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
                    placeholder={t`Tim`}
                    error={error?.message}
                    fullWidth
                  />
                )}
              />
            </StyledNameField>
            <StyledNameField>
              <Controller
                name="lastName"
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <TextInput
                    label={t`Last name`}
                    value={value}
                    onFocus={() => setIsEditingMode(true)}
                    onBlur={() => {
                      onBlur();
                      setIsEditingMode(false);
                    }}
                    onChange={onChange}
                    placeholder={t`Apple`}
                    error={error?.message}
                    fullWidth
                  />
                )}
              />
            </StyledNameField>
          </StyledNameRow>
          <Controller
            name="jobTitle"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t`Job Title`}
                value={value}
                onFocus={() => setIsEditingMode(true)}
                onBlur={() => {
                  onBlur();
                  setIsEditingMode(false);
                }}
                onChange={onChange}
                placeholder={t`Head of Partnerships`}
                fullWidth
              />
            )}
          />
        </StyledForm>
      </OnboardingStepAnimatedItem>

      <OnboardingStepAnimatedItem index={3}>
        <StyledButtonContainer>
          <MainButton
            title={t`Continue`}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting || isNavigating}
            fullWidth
          />
        </StyledButtonContainer>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStepPage>
  );
};
