import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { SidePanelRoutedPage } from '@/side-panel/routing/components/SidePanelRoutedPage';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';
const HOSTABLE_TARGET = '/settings/objects/companies/name';

const mockOpenRoutedPageInSidePanel = jest.fn();
jest.mock('@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel', () => ({
  useOpenRoutedPageInSidePanel: () => ({
    openRoutedPageInSidePanel: mockOpenRoutedPageInSidePanel,
  }),
}));

const mockRowClick = jest.fn();

jest.mock('@/side-panel/routing/constants/SidePanelHostableRoutes', () => {
  const { Link } = jest.requireActual('react-router-dom');

  return {
    SIDE_PANEL_HOSTABLE_ROUTES: [
      {
        path: '/settings/objects/:objectNamePlural',
        // A row that pairs a link with its own panel-aware handler, the shape
        // settings tables use, is what makes a naive preventDefault open the
        // page twice.
        element: (
          <div onClick={() => mockRowClick()}>
            <Link to="/settings/objects/companies/name">Field name</Link>
            <Link to="/settings/objects/companies/new-field/select">
              Add field
            </Link>
            <a href="https://twenty.com">External</a>
          </div>
        ),
        resolvePageInfo: () => ({ title: 'Companies' }),
      },
      {
        path: '/settings/objects/:objectNamePlural/:fieldName',
        element: <div>hosted field page</div>,
        resolvePageInfo: () => ({ title: 'Name' }),
      },
    ],
  };
});

const renderHostedPage = () => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(isCookieAuthActiveState.atom, true);
      store.set(
        sidePanelRoutedPagePathComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        '/settings/objects/companies',
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/chat/thread-1']}>
          <SidePanelPageComponentInstanceContext.Provider
            value={{ instanceId: PAGE_INSTANCE_ID }}
          >
            {children}
          </SidePanelPageComponentInstanceContext.Provider>
        </MemoryRouter>
      </I18nProvider>
    </BaseWrapper>
  );

  return render(<SidePanelRoutedPage />, { wrapper });
};

describe('links inside a page hosted in the side panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open a hostable link on the panel instead of the main outlet', async () => {
    renderHostedPage();

    await userEvent.click(await screen.findByText('Field name'));

    expect(mockOpenRoutedPageInSidePanel).toHaveBeenCalledTimes(1);
    expect(mockOpenRoutedPageInSidePanel).toHaveBeenCalledWith({
      path: HOSTABLE_TARGET,
    });
  });

  it('should not let the surrounding row handler open the same page again', async () => {
    renderHostedPage();

    await userEvent.click(await screen.findByText('Field name'));

    expect(mockRowClick).not.toHaveBeenCalled();
  });

  it('should leave a target the panel cannot host to the main outlet', async () => {
    renderHostedPage();

    await userEvent.click(await screen.findByText('Add field'));

    expect(mockOpenRoutedPageInSidePanel).not.toHaveBeenCalled();
    expect(mockRowClick).toHaveBeenCalled();
  });

  it('should leave an external link alone', async () => {
    renderHostedPage();

    await userEvent.click(await screen.findByText('External'));

    expect(mockOpenRoutedPageInSidePanel).not.toHaveBeenCalled();
  });

  it('should let a modifier click still open a new tab', async () => {
    renderHostedPage();

    fireEvent.click(await screen.findByText('Field name'), { metaKey: true });

    expect(mockOpenRoutedPageInSidePanel).not.toHaveBeenCalled();
  });
});
