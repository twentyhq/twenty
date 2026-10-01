import { OnboardingInviteTeamSkipDialog } from '@/onboarding/components/OnboardingInviteTeamSkipDialog';
import { OnboardingRewardMainButton } from '@/onboarding/components/OnboardingRewardMainButton';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

export const InviteTeam = () => {
  const { t } = useLingui();
  const {
    control,
    fields,
    remove,
    handleSkip,
    handleInvite,
    openSkipDialog,
    emailIndexToFocus,
    getPlaceholder,
    isValid,
    isSubmitting,
    isNavigating,
  } = useInviteTeam();
  const { inviteTeamButtonReward } = useAtomStateValue(
    onboardingCreditsProgressSelector,
  );
  const emailInputToFocusRef = useRef<HTMLInputElement>(null);
  const transition = useOnboardingMotionTransition();

  const canRemoveEmailField = fields.length > 1;

  return (
    <StyledOnboardingStepPage data-testid="onboarding-invite-team-step">
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Invite your team`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {t`Get the most out of your workspace by inviting your team.`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      <OnboardingStepAnimatedItem index={2}>
        <StyledForm>
          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, y: -ONBOARDING_MOTION_SLIDE_OFFSET }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -ONBOARDING_MOTION_SLIDE_OFFSET }}
                transition={transition}
              >
                <Controller
                  name={`emails.${index}.email`}
                  control={control}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <TextInput
                      ref={
                        index === emailIndexToFocus
                          ? emailInputToFocusRef
                          : undefined
                      }
                      autoFocus={index === 0}
                      type="email"
                      value={value}
                      placeholder={getPlaceholder(index)}
                      onBlur={onBlur}
                      error={error?.message}
                      onChange={onChange}
                      RightIcon={canRemoveEmailField ? IconX : undefined}
                      onRightIconClick={
                        canRemoveEmailField ? () => remove(index) : undefined
                      }
                      noErrorHelper
                      fullWidth
                    />
                  )}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </StyledForm>
      </OnboardingStepAnimatedItem>

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          <OnboardingRewardMainButton
            label={t`Invite`}
            creditsReward={inviteTeamButtonReward.creditsReward}
            isRewardPerItem={inviteTeamButtonReward.isRewardPerItem}
            disabled={!isValid}
            isLoading={isSubmitting || isNavigating}
            onClick={handleInvite}
          />
          <OnboardingSkipButton
            onClick={() => void openSkipDialog()}
            disabled={isSubmitting || isNavigating}
          />
        </StyledFooter>
      </OnboardingStepAnimatedItem>
      <OnboardingInviteTeamSkipDialog
        isValid={isValid}
        finalFocus={emailInputToFocusRef}
        onInvite={handleInvite}
        onSkip={() => void handleSkip()}
      />
    </StyledOnboardingStepPage>
  );
};
