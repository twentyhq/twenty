import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { OnboardingProfilePictureUploader } from '@/onboarding/components/OnboardingProfilePictureUploader';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
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
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { z } from 'zod';

const CONTENT_BLOCK_WIDTH = 340;

const StyledContent = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[14]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledNameRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledNameField = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  width: ${CONTENT_BLOCK_WIDTH}px;
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

export const CreateProfileV2 = () => {
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
      } catch (error: any) {
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
      onSubmit(getValues());
    }
  };

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: handleEnter,
    focusId: PageFocusId.CreateProfileV2,
    dependencies: [handleEnter],
  });

  return (
    <OnboardingV2Layout>
      <StyledContent>
        <StyledHeading>
          <StyledTitle>{t`Create profile`}</StyledTitle>
          <StyledSubtitle>
            {t`How you'll appear to teammates and agents.`}
          </StyledSubtitle>
        </StyledHeading>

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

        <StyledButtonContainer>
          <MainButton
            title={t`Continue`}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
            fullWidth
          />
        </StyledButtonContainer>
      </StyledContent>
    </OnboardingV2Layout>
  );
};
