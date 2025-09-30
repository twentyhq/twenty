import { MessageFolderImportPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageFoldersCard } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFoldersCard';
import { SettingsAccountsMessageFolderIcon } from '@/settings/accounts/components/SettingsAccountsMessageFolderIcon';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { msg } from '@lingui/core/macro';

type SettingsAccountsMessageFolderCardProps = {
  onChange: (nextValue: MessageFolderImportPolicy) => void;
  value?: MessageFolderImportPolicy;
};

const INBOX_SETTINGS_VISIBILITY_OPTIONS = [
  {
    title: msg`Everything`,
    description: msg`Import all emails`,
    value: MessageFolderImportPolicy.ALL_FOLDERS,
    cardMedia: (
      <SettingsAccountsMessageFolderIcon
        value={MessageFolderImportPolicy.ALL_FOLDERS}
      />
    ),
  },
  {
    title: msg`Some folders`,
    description: msg`Import only selected folders/labels`,
    value: MessageFolderImportPolicy.SELECTED_FOLDERS,
    cardMedia: (
      <SettingsAccountsMessageFolderIcon
        value={MessageFolderImportPolicy.SELECTED_FOLDERS}
      />
    ),
    cardContentExpanded: <SettingsAccountsMessageFoldersCard />,
  },
];

export const SettingsAccountsMessageFolderCard = ({
  onChange,
  value = MessageFolderImportPolicy.SELECTED_FOLDERS,
}: SettingsAccountsMessageFolderCardProps) => (
  <SettingsAccountsRadioSettingsCard
    name="message-folder-import-policy"
    options={INBOX_SETTINGS_VISIBILITY_OPTIONS}
    value={value}
    onChange={onChange}
  />
);
