import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';
import { Key } from 'ts-key-enum';

import { OnboardingV2Frame } from '@/onboarding/components/OnboardingV2Frame';
import { useInviteTeamOnboarding } from '@/onboarding/hooks/useInviteTeamOnboarding';
import { PageFocusId } from '@/types/PageFocusId';
import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { MainButton } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  margin-top: ${themeCssVariables.spacing[14]};
`;

const StyledEmailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const InviteTeamV2 = () => {
  const { t } = useLingui();
  const {
    control,
    fields,
    handleSubmit,
    onSubmit,
    handleSkip,
    getPlaceholder,
    isValid,
    isSubmitting,
  } = useInviteTeamOnboarding();

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: () => {
      handleSubmit(onSubmit)();
    },
    focusId: PageFocusId.InviteTeam,
    dependencies: [handleSubmit, onSubmit],
  });

  return (
    <OnboardingV2Frame
      activeStep={3}
      title={<Trans>Invite your team</Trans>}
      subtitle={
        <Trans>Get the most out of your workspace by inviting your team.</Trans>
      }
    >
      <StyledForm>
        <StyledEmailsContainer>
          {fields.map((field, index) => (
            <Controller
              key={field.id}
              name={`emails.${index}.email`}
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInput
                  autoFocus={index === 0}
                  type="email"
                  value={value}
                  placeholder={getPlaceholder(index)}
                  onBlur={onBlur}
                  error={error?.message}
                  onChange={onChange}
                  noErrorHelper
                  fullWidth
                />
              )}
            />
          ))}
        </StyledEmailsContainer>
        <StyledButtonContainer>
          <MainButton
            title={t`Invite`}
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit(onSubmit)}
            fullWidth
          />
          <MainButton
            title={t`Skip`}
            variant="secondary"
            onClick={handleSkip}
            fullWidth
          />
        </StyledButtonContainer>
      </StyledForm>
    </OnboardingV2Frame>
  );
};
