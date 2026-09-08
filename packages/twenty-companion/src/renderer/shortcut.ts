type ShortcutKeyboardEvent = Pick<
  KeyboardEvent,
  'key' | 'code' | 'repeat' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'
>;

export const shortcutFromKeyboardEvent = (
  event: ShortcutKeyboardEvent,
): string | null => {
  if (event.repeat || !(event.metaKey || event.ctrlKey || event.altKey))
    return null;
  let key: string;
  if (event.code === 'Space') key = 'Space';
  else if (/^Key[A-Z]$/.test(event.code)) key = event.code.slice(3);
  else if (/^Digit[0-9]$/.test(event.code)) key = event.code.slice(5);
  else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(event.code)) key = event.code;
  else return null;
  return [
    event.metaKey && 'Command',
    event.ctrlKey && 'Control',
    event.altKey && 'Alt',
    event.shiftKey && 'Shift',
    key,
  ]
    .filter(Boolean)
    .join('+');
};

export const formatShortcut = (shortcut: string, isMac: boolean): string => {
  const modifiers: Record<string, string> = {
    CommandOrControl: isMac ? '⌘' : 'Ctrl',
    Command: '⌘',
    Control: 'Ctrl',
    Alt: isMac ? '⌥' : 'Alt',
  };
  return shortcut
    .split('+')
    .map((key) => modifiers[key] ?? key)
    .join(' + ');
};
