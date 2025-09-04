import {
  StyledItem,
  StyledShortcutKey,
  StyledShortcutKeyContainer,
} from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import { t } from '@lingui/core/macro';

type KeyboardMenuItemProps = {
  shortcut: Shortcut;
};

export const KeyboardMenuItem = ({ shortcut }: KeyboardMenuItemProps) => {
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
            {t`then`}
            <StyledShortcutKey>{shortcut.secondHotKey}</StyledShortcutKey>
          </StyledShortcutKeyContainer>
        )
      ) : (
        <StyledShortcutKey>{shortcut.firstHotKey}</StyledShortcutKey>
      )}
    </StyledItem>
  );
};
