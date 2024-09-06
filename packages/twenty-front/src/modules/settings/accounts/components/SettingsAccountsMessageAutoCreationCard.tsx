import { MessageChannelContactAutoCreationPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageAutoCreationIcon } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationIcon';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';

type SettingsAccountsMessageAutoCreationCardProps = {
  onChange: (nextValue: MessageChannelContactAutoCreationPolicy) => void;
  value?: MessageChannelContactAutoCreationPolicy;
};

const autoCreationOptions = [
  {
    title: 'Enviados e Recebidos',
    description: 'Pessoas para quem enviei e recebi emails.',
    value: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
    cardMedia: (
      <SettingsAccountsMessageAutoCreationIcon isSentActive isReceivedActive />
    ),
  },
  {
    title: 'Enviados',
    description: 'Pessoas para quem enviei emails.',
    value: MessageChannelContactAutoCreationPolicy.SENT,
    cardMedia: <SettingsAccountsMessageAutoCreationIcon isSentActive />,
  },
  {
    title: 'Nenhum',
    description: 'Não criar contatos automaticamente.',
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
