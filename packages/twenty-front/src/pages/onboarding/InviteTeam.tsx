import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingFreeCreditsCtaTag } from '@/onboarding/components/free-credits/OnboardingFreeCreditsCtaTag';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { isNonEmptyString } from '@sniptt/guards';
import { Controller, useWatch } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
    handleSubmit,
    onSubmit,
    handleSkip,
    getPlaceholder,
    isValid,
    isSubmitting,
    isNavigating,
  } = useInviteTeam();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const creditsRewardPerUser = onboardingConfig?.inviteTeamCreditsRewardPerUser;
  const { formatNumber } = useNumberFormat();
  const emails = useWatch({ control, name: 'emails' });
  const transition = useOnboardingMotionTransition();

  const canRemoveEmailField = fields.length > 1;

  // Credits come once invited teammates join, up to the onboarding invite limit.
  const getCreditsTagLabel = (rewardPerUser: number) => {
    const invitedTeammatesCount = Math.min(
      emails.filter(({ email }) => isNonEmptyString(email.trim())).length,
      onboardingConfig?.inviteTeamMaxInvites ?? 0,
    );
    const formattedRewardPerUser = formatNumber(rewardPerUser, { decimals: 2 });

    return invitedTeammatesCount > 0
      ? `+${formatNumber(rewardPerUser * invitedTeammatesCount, { decimals: 2 })}`
      : t`+${formattedRewardPerUser} each`;
  };

  return (
    <StyledOnboardingStepPage>
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
          <MainButton
            startIcon={isSubmitting || isNavigating ? <Loader /> : null}
            disabled={!isValid || isSubmitting || isNavigating}
            onClick={handleSubmit(onSubmit)}
            fullWidth
          >
            {t`Invite`}
            {isDefined(creditsRewardPerUser) && (
              <OnboardingFreeCreditsCtaTag
                label={getCreditsTagLabel(creditsRewardPerUser)}
              />
            )}
          </MainButton>
          <OnboardingSkipButton
            onClick={handleSkip}
            disabled={isSubmitting || isNavigating}
          />
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStepPage>
  );
};
