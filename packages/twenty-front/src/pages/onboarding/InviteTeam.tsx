import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { TextInput } from '@/ui/input/components/TextInput';
import { ModalContent } from 'twenty-ui/surfaces';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy } from 'twenty-ui/icon';
import { SeparatorLineText } from 'twenty-ui/typography';
import { LightButton, MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAnimatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow-x: hidden;
  overflow-y: scroll;
  padding: ${themeCssVariables.spacing[8]} 0;
  width: 100%;
`;

const StyledActionLinkContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 200px;
`;

const StyledActionSkipLinkContainer = styled.div`
  margin: ${themeCssVariables.spacing[3]} 0 0;
`;

export const InviteTeam = () => {
  const { t } = useLingui();
  const {
    control,
    fields,
    handleSubmit,
    onSubmit,
    handleSkip,
    copyInviteLink,
    getPlaceholder,
    hasPrefilledSuggestions,
    hasCalendarBooking,
    isValid,
    isSubmitting,
    currentWorkspace,
  } = useInviteTeam();

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <Title>
        <Trans>Invite your team</Trans>
      </Title>
      <SubTitle>
        {hasPrefilledSuggestions ? (
          <Trans>
            We found teammates from your calendar. Review and invite them.
          </Trans>
        ) : (
          <Trans>
            Get the most out of your workspace by inviting your team.
          </Trans>
        )}
      </SubTitle>
      <StyledAnimatedContainer>
        {fields.map((field, index) => (
          <Controller
            key={index}
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
        {isDefined(currentWorkspace?.inviteHash) && (
          <>
            <SeparatorLineText>
              <Trans>or</Trans>
            </SeparatorLineText>
            <StyledActionLinkContainer>
              <LightButton
                title={t`Copy invitation link`}
                accent="tertiary"
                onClick={copyInviteLink}
                Icon={IconCopy}
              />
            </StyledActionLinkContainer>
          </>
        )}
      </StyledAnimatedContainer>
      <StyledButtonContainer>
        <MainButton
          title={hasCalendarBooking ? t`Continue` : t`Finish`}
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit(onSubmit)}
          fullWidth
        />
      </StyledButtonContainer>
      <StyledActionSkipLinkContainer>
        <ClickToActionLink onClick={handleSkip}>
          <Trans>Skip</Trans>
        </ClickToActionLink>
      </StyledActionSkipLinkContainer>
    </ModalContent>
  );
};
