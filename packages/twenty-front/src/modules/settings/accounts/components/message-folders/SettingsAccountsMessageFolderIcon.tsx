import { type MessageFolder } from '@/accounts/types/MessageFolder';
import {
  IconFolder,
  IconFolderRoot,
  IconInbox,
  IconSend,
} from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
type SettingsAccountsMessageFolderIconProps = {
  folder: MessageFolder;
  isChildFolder?: boolean;
};

export const SettingsAccountsMessageFolderIcon = ({
  folder,
  isChildFolder = false,
}: SettingsAccountsMessageFolderIconProps) => {
  const { theme } = useContext(ThemeContext);

  if (folder.isSentFolder) {
    return <IconSend size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
  }

  if (folder.name.toLowerCase().includes('inbox')) {
    return (
      <IconInbox size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    );
  }

  if (isChildFolder) {
    return (
      <IconFolderRoot size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    );
  }

  return <IconFolder size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
};
