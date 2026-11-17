import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { MainNavigationDrawerFixedRows } from '@/navigation/components/MainNavigationDrawerFixedRows';

let mockIsCustomizableSidebarEnabled = true;
let mockHasAiPermission = true;
let mockIsMobile = false;
const mockOpenRecordsSearchPage = jest.fn();
const mockSwitchToNewChat = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsCustomizableSidebarEnabled,
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasAiPermission,
}));

jest.mock('@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel', () => ({
  useOpenRecordsSearchPageInSidePanel: () => ({
    openRecordsSearchPage: mockOpenRecordsSearchPage,
  }),
}));

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat: mockSwitchToNewChat }),
}));

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

const renderFixedRows = () =>
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={createStore()}>
        <MemoryRouter>
          <MainNavigationDrawerFixedRows />
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

describe('MainNavigationDrawerFixedRows', () => {
  beforeEach(() => {
    mockIsCustomizableSidebarEnabled = true;
    mockHasAiPermission = true;
    mockIsMobile = false;
    jest.clearAllMocks();
  });

  it('opens search and starts a new chat from the fixed rows', async () => {
    renderFixedRows();

    await userEvent.click(screen.getByText('Search'));
    await userEvent.click(screen.getByText('New AI chat'));

    expect(mockOpenRecordsSearchPage).toHaveBeenCalledTimes(1);
    expect(mockSwitchToNewChat).toHaveBeenCalledTimes(1);
  });

  it('hides the new chat row without AI permission', () => {
    mockHasAiPermission = false;

    renderFixedRows();

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.queryByText('New AI chat')).not.toBeInTheDocument();
  });

  it('renders nothing when the flag is off or on mobile', () => {
    mockIsCustomizableSidebarEnabled = false;
    const { unmount } = renderFixedRows();

    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    unmount();

    mockIsCustomizableSidebarEnabled = true;
    mockIsMobile = true;
    renderFixedRows();

    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });
});
