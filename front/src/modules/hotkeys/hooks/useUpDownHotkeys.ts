import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeyCallback } from 'react-hotkeys-hook/dist/types';
import { OptionsOrDependencyArray } from 'react-hotkeys-hook/dist/types';

export function useUpDownHotkeys(
  upArrowCallBack: HotkeyCallback,
  downArrownCallback: HotkeyCallback,
  dependencies?: OptionsOrDependencyArray,
) {
  useHotkeys(
    'up',
    upArrowCallBack,
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    dependencies,
  );

  useHotkeys(
    'down',
    downArrownCallback,
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    dependencies,
  );
}
