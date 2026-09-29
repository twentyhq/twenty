import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { msg } from '@lingui/core/macro';
import { MessageChannelVisibility } from '~/generated/graphql';

type SettingsAccountsMessageVisibilityCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

const inboxSettingsVisibilityOptions = [
  {
    title: msg`Shared with everyone`,
    description: msg`Everyone in your workspace can read the subject, body and attachments.`,
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
    title: msg`Private`,
    description: msg`Only you and others who received an email can read it. Your workspace sees who took part and when.`,
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
  <SettingsRadioSettingsCard
    name="message-visibility"
    options={inboxSettingsVisibilityOptions}
    // Subjects are no longer shared on their own, so this level is private.
    value={
      value === MessageChannelVisibility.SUBJECT
        ? MessageChannelVisibility.METADATA
        : value
    }
    onChange={onChange}
  />
);
