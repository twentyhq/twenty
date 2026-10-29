import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { ThemeProvider } from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { salesfarceIsActiveState } from '@/salesfarce/states/salesfarceIsActiveState';
import { salesfarceConsumeRequest } from '@/salesfarce/utils/salesfarceConsumeRequest';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsAppearance } from '~/pages/settings/profile/appearance/components/SettingsAppearance';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const updateSettings = jest.fn().mockResolvedValue(undefined);

jest.mock('@/workspace-member/hooks/useUpdateWorkspaceMemberSettings', () => ({
  useUpdateWorkspaceMemberSettings: () => ({
    updateWorkspaceMemberSettings: updateSettings,
  }),
}));

const reloadWindow = jest.fn();

jest.mock('~/utils/reloadWindow', () => ({
  reloadWindow: () => reloadWindow(),
}));

dynamicActivate(SOURCE_LOCALE);

const renderAppearance = () => {
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    id: 'appearance-member',
    name: { firstName: 'Alex', lastName: 'Example' },
    userEmail: 'alex@example.com',
    locale: 'en',
    colorScheme: 'Light',
  });

  return render(
    <JotaiProvider store={jotaiStore}>
      <ThemeProvider colorScheme="light" applyToRoot={false}>
        <I18nProvider i18n={i18n}>
          <ToastProvider>
            <SettingsAppearance />
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </JotaiProvider>,
  );
};

describe('SettingsAppearance with Salesfarce', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'PointerEvent', { value: MouseEvent });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('reloads into Salesfarce without saving it as the theme', async () => {
    renderAppearance();

    await userEvent.click(screen.getByRole('radio', { name: 'Salesfarce' }));

    expect(salesfarceConsumeRequest()).toBe(true);
    expect(reloadWindow).toHaveBeenCalledTimes(1);
    expect(updateSettings).not.toHaveBeenCalled();
  });

  it('saves the picked theme and reloads out of Salesfarce', async () => {
    jotaiStore.set(salesfarceIsActiveState.atom, true);
    renderAppearance();

    expect(screen.getByRole('radio', { name: 'Salesfarce' })).toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(updateSettings).toHaveBeenCalledWith({
      workspaceMemberId: 'appearance-member',
      update: { colorScheme: 'Dark' },
    });
    expect(updateSettings).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(reloadWindow).toHaveBeenCalledTimes(1));
  });
});
