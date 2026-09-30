import { useLingui } from '@lingui/react/macro';

export const useShortcutAccessibleKeyLabels = () => {
  const { t } = useLingui();

  return {
    Command: t`Command`,
    Option: t`Option`,
    Shift: t`Shift`,
    Control: t`Control`,
    Enter: t`Enter`,
    Backspace: t`Backspace`,
    'Arrow up': t`Arrow up`,
    'Arrow down': t`Arrow down`,
    'Arrow left': t`Arrow left`,
    'Arrow right': t`Arrow right`,
    Escape: t`Escape`,
    Alt: t`Alt`,
    Space: t`Space`,
    Tab: t`Tab`,
    Delete: t`Delete`,
  };
};
