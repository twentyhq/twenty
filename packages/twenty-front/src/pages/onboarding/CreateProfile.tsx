import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isOnboardingV2EnabledState } from '@/client-config/states/isOnboardingV2EnabledState';
import { useCreateProfileOnboarding } from '@/onboarding/hooks/useCreateProfileOnboarding';
import { WorkspaceMemberPictureUploader } from '@/settings/workspace-member/components/WorkspaceMemberPictureUploader';
import { PageFocusId } from '@/types/PageFocusId';
import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui-deprecated/display';
import { MainButton } from 'twenty-ui-deprecated/input';
import { ModalContent } from 'twenty-ui-deprecated/layout';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { CreateProfileV2 } from './CreateProfileV2';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 200px;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${themeCssVariables.spacing[4]};
  }
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

const CreateProfileV1 = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { createProfile } = useCreateProfileOnboarding();

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
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <Title noMarginTop>
        <Trans>Create profile</Trans>
      </Title>
      <SubTitle>
        <Trans>How you'll be identified on the app.</Trans>
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title={t`Picture`} />
          {currentWorkspaceMember?.id && (
            <WorkspaceMemberPictureUploader
              workspaceMemberId={currentWorkspaceMember.id}
            />
          )}
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
    </ModalContent>
  );
};

export const CreateProfile = () => {
  const isOnboardingV2Enabled = useAtomStateValue(isOnboardingV2EnabledState);

  return isOnboardingV2Enabled ? <CreateProfileV2 /> : <CreateProfileV1 />;
};
