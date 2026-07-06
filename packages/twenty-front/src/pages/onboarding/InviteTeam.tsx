import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTagsRow } from '@/onboarding/components/StyledOnboardingStepTagsRow';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
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
  const transition = useOnboardingMotionTransition();

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
        {isDefined(creditsRewardPerUser) && (
          <OnboardingStepAnimatedItem index={2}>
            <StyledOnboardingStepTagsRow>
              <OnboardingCreditsRewardTag
                amount={creditsRewardPerUser}
                suffix={t`free credits per user`}
              />
            </StyledOnboardingStepTagsRow>
          </OnboardingStepAnimatedItem>
        )}
      </StyledOnboardingStepHeading>

      <OnboardingStepAnimatedItem index={3}>
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
                      RightIcon={IconX}
                      onRightIconClick={() => remove(index)}
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

      <OnboardingStepAnimatedItem index={4}>
        <StyledFooter>
          <MainButton
            title={t`Invite`}
            disabled={!isValid || isSubmitting || isNavigating}
            onClick={handleSubmit(onSubmit)}
            fullWidth
          />
          <OnboardingSkipButton
            onClick={handleSkip}
            disabled={isSubmitting || isNavigating}
          />
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStepPage>
  );
};
