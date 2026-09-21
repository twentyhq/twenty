import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { IconMoon, IconSun } from 'twenty-ui/icon';

import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

jest.mock('@/ui/theme/hooks/useColorScheme');

describe('workspace theme menu rows', () => {
  it('preserves the checked theme and handles selection without bubbling', async () => {
    const user = userEvent.setup();
    const setColorScheme = jest.fn();
    const onParentClick = jest.fn();

    jest.mocked(useColorScheme).mockReturnValue({
      colorScheme: 'Dark',
      colorSchemeList: [
        { id: 'Dark', icon: IconMoon },
        { id: 'Light', icon: IconSun },
      ],
      setColorScheme,
    });

    render(
      <Provider store={createStore()}>
        <I18nProvider i18n={i18n}>
          <div onClick={onParentClick}>
            <MultiWorkspaceDropdownThemesComponents />
          </div>
        </I18nProvider>
      </Provider>,
    );

    expect(
      screen.getByRole('option', { name: 'Dark', selected: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Light', selected: false }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Light' }));

    expect(setColorScheme).toHaveBeenCalledTimes(1);
    expect(setColorScheme).toHaveBeenCalledWith('Light');
    expect(onParentClick).not.toHaveBeenCalled();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
  });
});
