import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';
import { isDefined } from 'twenty-shared/utils';

type LogConsoleToggleHotkeyEffectProps = {
  onToggle: () => void;
};

export const LogConsoleToggleHotkeyEffect = ({
  onToggle,
}: LogConsoleToggleHotkeyEffectProps) => {
  const store = useStore();

  useHotkeys(
    ['ctrl+j', 'meta+j'],
    (keyboardEvent) => {
      const lastFocusStackItem = store.get(focusStackState.atom).at(-1);

      // Pages like Settings turn off modifier hotkeys for their own content,
      // but the console is docked outside of it, so only overlays such as
      // dialogs or dropdowns may block the toggle
      const isBlockedByOverlay =
        isDefined(lastFocusStackItem) &&
        lastFocusStackItem.componentInstance.componentType !==
          FocusComponentType.PAGE &&
        !lastFocusStackItem.globalHotkeysConfig
          .enableGlobalHotkeysWithModifiers;

      if (isBlockedByOverlay) {
        return;
      }

      keyboardEvent.preventDefault();
      onToggle();
    },
    { enableOnContentEditable: true, enableOnFormTags: true },
    [onToggle, store],
  );

  return null;
};
