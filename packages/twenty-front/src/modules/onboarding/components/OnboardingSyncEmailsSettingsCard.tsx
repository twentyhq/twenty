import { ONBOARDING_SYNC_EMAILS_OPTIONS } from '@/onboarding/constants/OnboardingSyncEmailsOptions';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MessageChannelVisibility } from '~/generated/graphql';

type OnboardingSyncEmailsSettingsCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

const StyledCardMediaContainer = styled.div`
  width: ${themeCssVariables.spacing[10]};
`;

export const OnboardingSyncEmailsSettingsCard = ({
  onChange,
  value = MessageChannelVisibility.SHARE_EVERYTHING,
}: OnboardingSyncEmailsSettingsCardProps) => {
  const optionsWithCardMedia = ONBOARDING_SYNC_EMAILS_OPTIONS.map((option) => ({
    ...option,
    cardMedia: (
      <StyledCardMediaContainer>
        <SettingsAccountsVisibilityIcon
          metadata={option.cardMediaProps.metadata}
          subject={option.cardMediaProps.subject}
          body={option.cardMediaProps.body}
        />
      </StyledCardMediaContainer>
    ),
  }));

  return (
    <SettingsAccountsRadioSettingsCard
      name="sync-emails-visibility"
      options={optionsWithCardMedia}
      value={value}
      onChange={onChange}
    />
  );
};
