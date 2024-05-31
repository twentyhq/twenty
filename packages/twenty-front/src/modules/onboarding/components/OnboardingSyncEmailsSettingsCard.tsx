import { onboardingSyncEmailsOptions } from '@/onboarding/components/onboardingSyncEmailsOptions';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { MessageChannelVisibility } from '~/generated/graphql';

type OnboardingSyncEmailsSettingsCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

export const OnboardingSyncEmailsSettingsCard = ({
  onChange,
  value = MessageChannelVisibility.ShareEverything,
}: OnboardingSyncEmailsSettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={onboardingSyncEmailsOptions}
    value={value}
    onChange={onChange}
  />
);
