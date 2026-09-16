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
