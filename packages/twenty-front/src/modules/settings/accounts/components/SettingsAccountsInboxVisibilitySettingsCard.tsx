import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';
import { MessageChannelVisibility } from '~/generated/graphql';

type SettingsAccountsInboxVisibilitySettingsCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

const inboxSettingsVisibilityOptions = [
  {
    title: 'Everything',
    description: 'Subject, body and attachments will be shared with your team.',
    value: MessageChannelVisibility.ShareEverything,
    cardMedia: (
      <SettingsAccountsVisibilitySettingCardMedia
        metadata="active"
        subject="active"
        body="active"
      />
    ),
  },
  {
    title: 'Subject and metadata',
    description: 'Subject and metadata will be shared with your team.',
    value: MessageChannelVisibility.Subject,
    cardMedia: (
      <SettingsAccountsVisibilitySettingCardMedia
        metadata="active"
        subject="active"
        body="inactive"
      />
    ),
  },
  {
    title: 'Metadata',
    description: 'Timestamp and participants will be shared with your team.',
    value: MessageChannelVisibility.Metadata,
    cardMedia: (
      <SettingsAccountsVisibilitySettingCardMedia
        metadata="active"
        subject="inactive"
        body="inactive"
      />
    ),
  },
];

export const SettingsAccountsInboxVisibilitySettingsCard = ({
  onChange,
  value = MessageChannelVisibility.ShareEverything,
}: SettingsAccountsInboxVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={inboxSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
