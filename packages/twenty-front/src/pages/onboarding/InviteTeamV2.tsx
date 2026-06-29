import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
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

const CONTENT_BLOCK_WIDTH = 340;
const INVITE_TEAM_FREE_CREDITS = 0;

const StyledPage = styled.div`
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

const StyledCreditsRow = styled.div`
  display: flex;
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledSkipButton = styled.button`
  background-color: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[5]};
`;

export const InviteTeamV2 = () => {
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
    <OnboardingV2Layout freeCredits={INVITE_TEAM_FREE_CREDITS}>
      <StyledPage>
        <StyledHeading>
          <StyledTitle>{t`Invite your team`}</StyledTitle>
          <StyledSubtitle>
            {t`Get the most out of your workspace by inviting your team.`}
          </StyledSubtitle>
          {isDefined(creditsRewardPerUser) && (
            <StyledCreditsRow>
              <OnboardingCreditsRewardTag
                amount={creditsRewardPerUser}
                suffix={t`free credits per user`}
              />
            </StyledCreditsRow>
          )}
        </StyledHeading>

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
          <StyledSkipButton type="button" onClick={handleSkip}>
            {t`Skip`}
          </StyledSkipButton>
        </StyledFooter>
      </StyledPage>
    </OnboardingV2Layout>
  );
};
