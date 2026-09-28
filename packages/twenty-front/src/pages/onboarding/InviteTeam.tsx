import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingRewardMainButton } from '@/onboarding/components/OnboardingRewardMainButton';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingSkipDialog } from '@/onboarding/components/OnboardingSkipDialog';
import { OnboardingSkipDialogAvatars } from '@/onboarding/components/OnboardingSkipDialogAvatars';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { ONBOARDING_SKIP_DIALOG_IDS } from '@/onboarding/constants/OnboardingSkipDialogIds';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
import { TextInput } from '@/ui/input/components/TextInput';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

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
    getPlaceholder,
    isValid,
    isSubmitting,
    isNavigating,
  } = useInviteTeam();
  const transition = useOnboardingMotionTransition();
  const { openDialog } = useDialog();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const emails = useWatch({ control, name: 'emails' });
  const emailInputToFocusRef = useRef<HTMLInputElement>(null);

  const inviteEmails = getValidInviteEmails(emails.map(({ email }) => email));
  const hasInviteEmails = isNonEmptyArray(inviteEmails);
  const firstInvalidEmailIndex = emails.findIndex(
    ({ email }) =>
      isNonEmptyString(email) &&
      !isNonEmptyArray(getValidInviteEmails([email])),
  );
  const emailIndexToFocus = Math.max(firstInvalidEmailIndex, 0);
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const inviteTeamMaxInvites = onboardingConfig?.inviteTeamMaxInvites ?? 0;
  const inviteTeamCreditsRewardPerUser =
    onboardingConfig?.inviteTeamCreditsRewardPerUser ?? 0;
  const creditsReward = hasInviteEmails
    ? inviteTeamCreditsRewardPerUser *
      Math.min(inviteEmails.length, inviteTeamMaxInvites)
    : inviteTeamCreditsRewardPerUser;

  const handleSkipClick = () =>
    openDialog(ONBOARDING_SKIP_DIALOG_IDS.inviteTeam);

  const canRemoveEmailField = fields.length > 1;

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
            creditsReward={creditsReward}
            isRewardPerItem={!hasInviteEmails}
            disabled={!isValid || isSubmitting || isNavigating}
            isLoading={isSubmitting || isNavigating}
            onClick={handleInvite}
          />
          <OnboardingSkipButton
            onClick={handleSkipClick}
            disabled={isSubmitting || isNavigating}
          />
        </StyledFooter>
      </OnboardingStepAnimatedItem>
      <OnboardingSkipDialog
        dialogId={ONBOARDING_SKIP_DIALOG_IDS.inviteTeam}
        visual={
          <OnboardingSkipDialogAvatars
            avatars={[
              ...(isDefined(currentWorkspaceMember)
                ? [
                    {
                      id: currentWorkspaceMember.id,
                      name: `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`,
                      src: getAbsoluteImageUrl(
                        currentWorkspaceMember.avatarUrl,
                      ),
                      shape: 'circle' as const,
                    },
                  ]
                : []),
              ...inviteEmails.map((email) => ({
                id: email,
                name: email,
                shape: 'circle' as const,
              })),
            ]}
            emptySeatsCount={hasInviteEmails ? 0 : 2}
          />
        }
        title={
          hasInviteEmails
            ? plural(inviteEmails.length, {
                one: "Your invite isn't sent yet",
                other: "Your # invites aren't sent yet",
              })
            : t`Twenty works better with your team`
        }
        description={
          hasInviteEmails ? undefined : t`All it takes is their email.`
        }
        actions={[
          hasInviteEmails && isValid
            ? {
                label: plural(inviteEmails.length, {
                  one: 'Send invite',
                  other: 'Send # invites',
                }),
                onClick: handleInvite,
              }
            : { label: t`Add teammates`, onClick: () => {} },
        ]}
        creditsReward={creditsReward}
        isRewardPerItem={!hasInviteEmails}
        finalFocus={emailInputToFocusRef}
        onSkip={() => void handleSkip()}
      />
    </StyledOnboardingStepPage>
  );
};
