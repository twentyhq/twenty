import {
  StyledItem,
  StyledShortcutKey,
  StyledShortcutKeyContainer,
} from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import useI18n from '@/ui/i18n/useI18n';

type KeyboardMenuItemProps = {
  shortcut: Shortcut;
};

export const KeyboardMenuItem = ({ shortcut }: KeyboardMenuItemProps) => {
  const { translate } = useI18n('translations');
  return (
    <StyledItem>
      {shortcut.label}
      {shortcut.secondHotKey ? (
        shortcut.areSimultaneous ? (
          <StyledShortcutKeyContainer>
            <StyledShortcutKey>{shortcut.firstHotKey}</StyledShortcutKey>
            <StyledShortcutKey>{shortcut.secondHotKey}</StyledShortcutKey>
          </StyledShortcutKeyContainer>
        ) : (
          <StyledShortcutKeyContainer>
            <StyledShortcutKey>{shortcut.firstHotKey}</StyledShortcutKey>
            {translate('then')}
            <StyledShortcutKey>{shortcut.secondHotKey}</StyledShortcutKey>
          </StyledShortcutKeyContainer>
        )
      ) : (
        <StyledShortcutKey>{shortcut.firstHotKey}</StyledShortcutKey>
      )}
    </StyledItem>
  );
};
