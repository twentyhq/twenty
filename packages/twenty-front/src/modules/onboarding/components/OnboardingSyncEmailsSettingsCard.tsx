import { ONBOARDING_SYNC_EMAILS_OPTIONS } from '@/onboarding/constants/OnboardingSyncEmailsOptions';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import styled from '@emotion/styled';
import { MessageChannelVisibility } from '~/generated/graphql';

type OnboardingSyncEmailsSettingsCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

const StyledCardMedia = styled(SettingsAccountsVisibilityIcon)`
  width: ${({ theme }) => theme.spacing(10)};
`;

export const OnboardingSyncEmailsSettingsCard = ({
  onChange,
  value = MessageChannelVisibility.SHARE_EVERYTHING,
}: OnboardingSyncEmailsSettingsCardProps) => {
  const optionsWithCardMedia = ONBOARDING_SYNC_EMAILS_OPTIONS.map((option) => ({
    ...option,
    cardMedia: (
      <StyledCardMedia
        metadata={option.cardMediaProps.metadata}
        subject={option.cardMediaProps.subject}
        body={option.cardMediaProps.body}
      />
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
