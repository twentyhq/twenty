import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';

export enum InboxSettingsVisibilityValue {
  Everything = 'share_everything',
  SubjectMetadata = 'subject',
  Metadata = 'metadata',
}

type SettingsAccountsInboxVisibilitySettingsCardProps = {
  onChange: (nextValue: InboxSettingsVisibilityValue) => void;
  value?: InboxSettingsVisibilityValue;
};

const inboxSettingsVisibilityOptions = [
  {
    title: 'Everything',
    description: 'Subject, body and attachments will be shared with your team.',
    value: InboxSettingsVisibilityValue.Everything,
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
    value: InboxSettingsVisibilityValue.SubjectMetadata,
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
    value: InboxSettingsVisibilityValue.Metadata,
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
  value = InboxSettingsVisibilityValue.Everything,
}: SettingsAccountsInboxVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={inboxSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
