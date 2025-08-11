import { useHotkeysOnFocusedElementCallback } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElementCallback';
import { pendingHotkeyState } from '@/ui/utilities/hotkey/states/internal/pendingHotkeysState';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  type HotkeyCallback,
  type Keys,
  type Options,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type UseHotkeysOptionsWithoutBuggyOptions = Omit<Options, 'enabled'>;

export const useHotkeysOnFocusedElement = ({
  keys,
  callback,
  focusId,
  dependencies,
  options,
}: {
  keys: Keys;
  callback: HotkeyCallback;
  focusId: string;
  dependencies?: unknown[];
  options?: UseHotkeysOptionsWithoutBuggyOptions;
}) => {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  const callScopedHotkeyCallback =
    useHotkeysOnFocusedElementCallback(dependencies);

  const enableOnContentEditable = isDefined(options?.enableOnContentEditable)
    ? options.enableOnContentEditable
    : true;

  const enableOnFormTags = isDefined(options?.enableOnFormTags)
    ? options.enableOnFormTags
    : true;

  const preventDefault = isDefined(options?.preventDefault)
    ? options.preventDefault === true
    : true;

  const ignoreModifiers = isDefined(options?.ignoreModifiers)
    ? options.ignoreModifiers === true
    : false;

  return useHotkeys(
    keys,
    (keyboardEvent, hotkeysEvent) => {
      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          if (!pendingHotkey) {
            callback(keyboardEvent, hotkeysEvent);
            return;
          }
          setPendingHotkey(null);
        },
        focusId,
        preventDefault,
      });
    },
    {
      enableOnContentEditable,
      enableOnFormTags,
      ignoreModifiers,
    },
    dependencies,
  );
};
