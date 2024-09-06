import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { MessageChannelVisibility } from '~/generated/graphql';

type SettingsAccountsMessageVisibilityCardProps = {
  onChange: (nextValue: MessageChannelVisibility) => void;
  value?: MessageChannelVisibility;
};

const inboxSettingsVisibilityOptions = [
  {
    title: 'Tudo',
    description: 'Assunto, corpo e anexos serão compartilhados com sua equipe.',
    value: MessageChannelVisibility.ShareEverything,
    cardMedia: (
      <SettingsAccountsVisibilityIcon
        metadata="active"
        subject="active"
        body="active"
      />
    ),
  },
  {
    title: 'Assunto e metadados',
    description: 'Assunto e metadados serão compartilhados com sua equipe.',
    value: MessageChannelVisibility.Subject,
    cardMedia: (
      <SettingsAccountsVisibilityIcon
        metadata="active"
        subject="active"
        body="inactive"
      />
    ),
  },
  {
    title: 'Metadados',
    description: 'Data e participantes serão compartilhados com sua equipe.',
    value: MessageChannelVisibility.Metadata,
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
  value = MessageChannelVisibility.ShareEverything,
}: SettingsAccountsMessageVisibilityCardProps) => (
  <SettingsAccountsRadioSettingsCard
    name="message-visibility"
    options={inboxSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
