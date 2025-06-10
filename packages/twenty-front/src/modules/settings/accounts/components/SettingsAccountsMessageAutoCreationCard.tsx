import { MessageChannelContactAutoCreationPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageAutoCreationIcon } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationIcon';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { msg } from '@lingui/core/macro';

type SettingsAccountsMessageAutoCreationCardProps = {
  onChange: (nextValue: MessageChannelContactAutoCreationPolicy) => void;
  value?: MessageChannelContactAutoCreationPolicy;
};

const autoCreationOptions = [
  {
    title: msg`Sent and Received`,
    description: msg`People I’ve sent emails to and received emails from.`,
    value: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
    cardMedia: (
      <SettingsAccountsMessageAutoCreationIcon isSentActive isReceivedActive />
    ),
  },
  {
    title: msg`Sent`,
    description: msg`People I’ve sent emails to.`,
    value: MessageChannelContactAutoCreationPolicy.SENT,
    cardMedia: <SettingsAccountsMessageAutoCreationIcon isSentActive />,
  },
  {
    title: msg`None`,
    description: msg`Don’t auto-create contacts.`,
    value: MessageChannelContactAutoCreationPolicy.NONE,
    cardMedia: (
      <SettingsAccountsMessageAutoCreationIcon
        isSentActive={false}
        isReceivedActive={false}
      />
    ),
  },
];

export const SettingsAccountsMessageAutoCreationCard = ({
  onChange,
  value = MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
}: SettingsAccountsMessageAutoCreationCardProps) => (
  <SettingsAccountsRadioSettingsCard
    name="message-auto-creation"
    options={autoCreationOptions}
    value={value}
    onChange={onChange}
  />
);
