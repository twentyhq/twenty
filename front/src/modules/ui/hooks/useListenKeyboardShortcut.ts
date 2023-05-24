import { useHotkeys } from 'react-hotkeys-hook';

export type UseListenKeyboardShortcutOptions = {
  preventDefault: boolean;
};

/**
 * ### This hook listens to keyboard shortcuts and **PREVENTS** browser defaults
 * 
 * See documentation here : https://github.com/jaywcjlove/hotkeys
 *
 * Works on Chrome and Firefox, to override ctrl+z and ctrl+y for example
 * 
 * You can disable browser prevent defaults by passing `preventDefault: false` in options, 
 * it is at true by default since we generally always prevent defaults when listening for keyboard shortcuts on an app.
 *
 * #### Shortcut notation for first argument :
 * - ⌘ Command()
 * - ⌃ Control
 * - ⌥ Option(alt)
 * - ⇧ Shift
 * - ⇪ Caps Lock(Capital)
 * - ↩︎ return/Enter space
 *
 * Example : `⌘+z` or `⌘+⇧+z`
 *
 * #### Listening at multiple shortcuts :
 * `^+z, ⌘+z, ⌘+⇧+z`
 *
 * #### Disable prevent defaults :
 *
 * Pass option `preventDefault: false` in last argument like this :
 * ```
useKeyboardShortcutCallback(
    '⌘+y',
    () => {
      if(dependecyConditionIsMet) {
        performTask();
      }
    },
    [dependecyConditionIsMet, performTask],
    {
      preventDefault: false,
    },
);
 * ```
 *  */

export function useListenKeyboardShortcut(
  shortcuts: string,
  callback: () => void,
  deps: any[],
  options?: UseListenKeyboardShortcutOptions,
) {
  useHotkeys(
    shortcuts,
    (event: any) => {
      let preventDefault = true;

      const explicitlyDontPreventDefault = options?.preventDefault === false;

      if (explicitlyDontPreventDefault) {
        preventDefault = false;
      }

      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }

      callback();
    },
    {},
    deps ?? [],
  );
}
