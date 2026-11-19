import { isDefined } from 'twenty-shared/utils';

const MODIFIER_HOT_KEYS = new Set(['Mod', 'Ctrl', 'Alt', 'Shift']);

export const getCommandMenuItemShortcut = (hotKeys: string[]) =>
  hotKeys.reduce<string[][]>((shortcut, hotKey) => {
    const lastKeys = shortcut.at(-1);

    if (isDefined(lastKeys) && MODIFIER_HOT_KEYS.has(lastKeys.at(-1) ?? '')) {
      return [...shortcut.slice(0, -1), [...lastKeys, hotKey]];
    }

    return [...shortcut, [hotKey]];
  }, []);
