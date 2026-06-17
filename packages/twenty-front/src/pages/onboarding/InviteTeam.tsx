import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { isOnboardingV2EnabledState } from '@/client-config/states/isOnboardingV2EnabledState';
import { useInviteTeamOnboarding } from '@/onboarding/hooks/useInviteTeamOnboarding';
import { PageFocusId } from '@/types/PageFocusId';
import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy, SeparatorLineText } from 'twenty-ui-deprecated/display';
import { LightButton, MainButton } from 'twenty-ui-deprecated/input';
import { ModalContent } from 'twenty-ui-deprecated/layout';
import { ClickToActionLink } from 'twenty-ui-deprecated/navigation';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { InviteTeamV2 } from './InviteTeamV2';

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

const InviteTeamV1 = () => {
  const { t } = useLingui();
  const {
    control,
    fields,
    handleSubmit,
    onSubmit,
    handleSkip,
    getPlaceholder,
    copyInviteLink,
    currentWorkspace,
    hasCalendarBooking,
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
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <Title>
        <Trans>Invite your team</Trans>
      </Title>
      <SubTitle>
        <Trans>Get the most out of your workspace by inviting your team.</Trans>
      </SubTitle>
      <StyledAnimatedContainer>
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

export const InviteTeam = () => {
  const isOnboardingV2Enabled = useAtomStateValue(isOnboardingV2EnabledState);

  return isOnboardingV2Enabled ? <InviteTeamV2 /> : <InviteTeamV1 />;
};
