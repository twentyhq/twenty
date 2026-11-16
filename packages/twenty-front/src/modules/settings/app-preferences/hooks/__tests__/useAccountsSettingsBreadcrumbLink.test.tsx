import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { useAccountsSettingsBreadcrumbLink } from '@/settings/app-preferences/hooks/useAccountsSettingsBreadcrumbLink';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('useAccountsSettingsBreadcrumbLink', () => {
  it('links to app preferences', () => {
    expect(
      renderHook(() => useAccountsSettingsBreadcrumbLink(), { wrapper }).result
        .current,
    ).toEqual({
      children: 'Apps preferences',
      href: '/settings/app-preferences',
    });
  });
});
