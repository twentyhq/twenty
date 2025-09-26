import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { useTheme } from '@emotion/react';
import { IconFolder, IconInbox, IconSend } from 'twenty-ui/display';

type SettingsAccountsMessageFolderIconProps = {
  folder: MessageFolder;
};

export const SettingsAccountsMessageFolderIcon = ({
  folder,
}: SettingsAccountsMessageFolderIconProps) => {
  const theme = useTheme();
  if (folder.isSentFolder) {
    return <IconSend size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
  }

  if (folder.name.toLowerCase().includes('inbox')) {
    return (
      <IconInbox size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    );
  }

  return <IconFolder size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
};
