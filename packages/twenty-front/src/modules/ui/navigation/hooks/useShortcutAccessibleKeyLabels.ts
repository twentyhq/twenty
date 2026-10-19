import { useLingui } from '@lingui/react/macro';

export const useShortcutAccessibleKeyLabels = () => {
  const { t } = useLingui();

  return {
    '⌘': t`Command`,
    '⌥': t`Option`,
    '⇧': t`Shift`,
    '⌃': t`Control`,
    Ctrl: t`Control`,
    '⏎': t`Enter`,
    '↵': t`Enter`,
    '⌫': t`Backspace`,
    '↑': t`Arrow up`,
    '↓': t`Arrow down`,
    '←': t`Arrow left`,
    '→': t`Arrow right`,
    esc: t`Escape`,
  };
};
