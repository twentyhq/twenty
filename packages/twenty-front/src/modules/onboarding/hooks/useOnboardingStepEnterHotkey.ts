import { type PageFocusId } from '@/ui/utilities/focus/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useOnboardingStepEnterHotkey = ({
  focusId,
  onEnter,
}: {
  focusId: PageFocusId;
  onEnter: () => void;
}) =>
  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: (keyboardEvent) => {
      if (keyboardEvent.target instanceof HTMLButtonElement) {
        return;
      }
      onEnter();
    },
    focusId,
    dependencies: [onEnter],
    options: { preventDefault: false },
  });
