import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTagsRow } from '@/onboarding/components/StyledOnboardingStepTagsRow';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
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
  } = useInviteTeam();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const creditsRewardPerUser = onboardingConfig?.inviteTeamCreditsRewardPerUser;

  return (
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <StyledOnboardingStepTitle>{t`Invite your team`}</StyledOnboardingStepTitle>
        <StyledOnboardingStepSubtitle>
          {t`Get the most out of your workspace by inviting your team.`}
        </StyledOnboardingStepSubtitle>
        {isDefined(creditsRewardPerUser) && (
          <StyledOnboardingStepTagsRow>
            <OnboardingCreditsRewardTag
              amount={creditsRewardPerUser}
              suffix={t`free credits per user`}
            />
          </StyledOnboardingStepTagsRow>
        )}
      </StyledOnboardingStepHeading>

      <StyledForm>
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
                RightIcon={IconX}
                onRightIconClick={() => remove(index)}
                noErrorHelper
                fullWidth
              />
            )}
          />
        ))}
      </StyledForm>

      <StyledFooter>
        <MainButton
          title={t`Invite`}
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit(onSubmit)}
          fullWidth
        />
        <OnboardingSkipButton onClick={handleSkip} />
      </StyledFooter>
    </StyledOnboardingStepPage>
  );
};
