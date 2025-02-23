import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { MessageChannelVisibility } from '~/generated/graphql';
import { t } from '@lingui/core/macro';

type SettingsAccountsMessageVisibilityCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

const inboxSettingsVisibilityOptions = [
  {
    title: t`Everything`,
    description: t`Subject, body and attachments will be shared with your team.`,
    value: MessageChannelVisibility.SHARE_EVERYTHING,
    cardMedia: (
      <SettingsAccountsVisibilityIcon
        metadata="active"
        subject="active"
        body="active"
      />
    ),
  },
  {
    title: t`Subject and metadata`,
    description: t`Subject and metadata will be shared with your team.`,
    value: MessageChannelVisibility.SUBJECT,
    cardMedia: (
      <SettingsAccountsVisibilityIcon
        metadata="active"
        subject="active"
        body="inactive"
      />
    ),
  },
  {
    title: t`Metadata`,
    description: t`Timestamp and participants will be shared with your team.`,
    value: MessageChannelVisibility.METADATA,
    cardMedia: (
      <SettingsAccountsVisibilityIcon
        metadata="active"
        subject="inactive"
        body="inactive"
      />
    ),
  },
];

export const SettingsAccountsMessageVisibilityCard = ({
  onChange,
  value = MessageChannelVisibility.SHARE_EVERYTHING,
}: SettingsAccountsMessageVisibilityCardProps) => (
  <SettingsAccountsRadioSettingsCard
    name="message-visibility"
    options={inboxSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
