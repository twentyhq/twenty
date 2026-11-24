import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MainNavigationDrawerSearchField } from '@/navigation/components/MainNavigationDrawerSearchField';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';

const mockOpenRecordsSearchPage = jest.fn();

jest.mock(
  '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded',
);
jest.mock('@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel', () => ({
  useOpenRecordsSearchPageInSidePanel: () => ({
    openRecordsSearchPage: mockOpenRecordsSearchPage,
  }),
}));
jest.mock(
  '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem',
  () => ({
    NavigationDrawerItem: ({
      label,
      onClick,
    }: {
      label: string;
      onClick: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {label}
      </button>
    ),
  }),
);

const renderSearchField = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MainNavigationDrawerSearchField />
    </I18nProvider>,
  );

describe('MainNavigationDrawerSearchField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens search from the field when the sidebar is expanded', async () => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(true);

    renderSearchField();

    expect(screen.getByText('Search or ask...')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /Search or ask/ }),
    );

    expect(mockOpenRecordsSearchPage).toHaveBeenCalledTimes(1);
  });

  it('opens search from the icon when the sidebar is collapsed', async () => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(false);

    renderSearchField();

    expect(screen.queryByText('Search or ask...')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(mockOpenRecordsSearchPage).toHaveBeenCalledTimes(1);
  });
});
