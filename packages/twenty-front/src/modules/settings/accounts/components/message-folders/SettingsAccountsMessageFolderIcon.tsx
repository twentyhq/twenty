import { type MessageFolder } from '@/accounts/types/MessageFolder';
import {
  IconFolder,
  IconFolderRoot,
  IconInbox,
  IconSend,
} from 'twenty-ui/display';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
type SettingsAccountsMessageFolderIconProps = {
  folder: MessageFolder;
  isChildFolder?: boolean;
};

export const SettingsAccountsMessageFolderIcon = ({
  folder,
  isChildFolder = false,
}: SettingsAccountsMessageFolderIconProps) => {
  if (folder.isSentFolder) {
    return (
      <IconSend
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.sm)}
      />
    );
  }

  if (folder.name.toLowerCase().includes('inbox')) {
    return (
      <IconInbox
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.sm)}
      />
    );
  }

  if (isChildFolder) {
    return (
      <IconFolderRoot
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.sm)}
      />
    );
  }

  return (
    <IconFolder
      size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
      stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.sm)}
    />
  );
};
