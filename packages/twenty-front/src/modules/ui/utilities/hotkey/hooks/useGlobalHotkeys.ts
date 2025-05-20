import { useGlobalHotkeysCallback } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeysCallback';
import { pendingHotkeyState } from '@/ui/utilities/hotkey/states/internal/pendingHotkeysState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeyCallback, Keys, Options } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type UseHotkeysOptionsWithoutBuggyOptions = Omit<Options, 'enabled'>;

export const useGlobalHotkeys = (
  keys: Keys,
  callback: HotkeyCallback,
  containsModifier: boolean,
  // TODO: Remove this once we've migrated hotkey scopes to the new api
  hotkeyScope: HotkeyScope,
  dependencies?: unknown[],
  options?: UseHotkeysOptionsWithoutBuggyOptions,
) => {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  const callGlobalHotkeysCallback = useGlobalHotkeysCallback(dependencies);

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
      callGlobalHotkeysCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          if (!pendingHotkey) {
            callback(keyboardEvent, hotkeysEvent);
            return;
          }
          setPendingHotkey(null);
        },
        scope: hotkeyScope.scope,
        preventDefault,
        containsModifier,
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
