import { setupI18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';

import { useShortcutAccessibleKeyLabels } from '@/ui/utilities/hotkey/hooks/useShortcutAccessibleKeyLabels';

it('updates accessible key names when the active locale changes', () => {
  const controlMessage = msg`Control`;
  const arrowUpMessage = msg`Arrow up`;
  const i18n = setupI18n({
    locale: 'en',
    messages: {
      en: {},
      'en-GB': {
        [controlMessage.id]: 'Localized control key',
        [arrowUpMessage.id]: 'Localized up arrow',
      },
    },
  });
  const { result } = renderHook(() => useShortcutAccessibleKeyLabels(), {
    wrapper: ({ children }) => (
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    ),
  });

  expect(result.current.Control).toBe('Control');
  expect(result.current['Arrow up']).toBe('Arrow up');

  act(() => i18n.activate('en-GB'));

  expect(result.current.Control).toBe('Localized control key');
  expect(result.current['Arrow up']).toBe('Localized up arrow');
  expect(result.current.Enter).toBe('Enter');
});
