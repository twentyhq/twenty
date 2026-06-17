import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { OnboardingV2Frame } from '@/onboarding/components/OnboardingV2Frame';
import { useCreateProfileOnboarding } from '@/onboarding/hooks/useCreateProfileOnboarding';
import { WorkspaceMemberPictureUploader } from '@/settings/workspace-member/components/WorkspaceMemberPictureUploader';
import { PageFocusId } from '@/types/PageFocusId';
import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { MainButton } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[14]};
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${themeCssVariables.spacing[4]};
  }
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const firstNameErrorMessage = msg`First name can not be empty`;
const lastNameErrorMessage = msg`Last name can not be empty`;

const validationSchema = z
  .object({
    firstName: z.string().min(1, {
      error: i18n._(firstNameErrorMessage),
    }),
    lastName: z.string().min(1, {
      error: i18n._(lastNameErrorMessage),
    }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const CreateProfileV2 = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { createProfile } = useCreateProfileOnboarding();

  // Job title has no backend field on workspace member yet, so it is visual-only
  // for now and not submitted.
  const [jobTitle, setJobTitle] = useState('');

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

  const onSubmit: SubmitHandler<Form> = async (data) => {
    await createProfile({
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

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
    <OnboardingV2Frame
      activeStep={1}
      title={<Trans>Create profile</Trans>}
      subtitle={<Trans>How you'll appear to teammates and agents.</Trans>}
    >
      <StyledForm>
        {currentWorkspaceMember?.id && (
          <WorkspaceMemberPictureUploader
            workspaceMemberId={currentWorkspaceMember.id}
          />
        )}
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
                placeholder={t`Tim`}
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
                placeholder={t`Cook`}
                error={error?.message}
                fullWidth
              />
            )}
          />
        </StyledComboInputContainer>
        <TextInput
          label={t`Job Title`}
          value={jobTitle}
          onChange={setJobTitle}
          placeholder={t`Head of Partnerships`}
          fullWidth
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
    </OnboardingV2Frame>
  );
};
