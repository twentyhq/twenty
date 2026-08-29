import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';

import { SidePanelRoutedPage } from '@/side-panel/routing/components/SidePanelRoutedPage';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';

let mockHasPermission = true;

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasPermission,
}));

jest.mock('@/side-panel/routing/constants/SidePanelHostableRoutes', () => ({
  SIDE_PANEL_HOSTABLE_ROUTES: [
    {
      path: '/settings/objects/:objectNamePlural',
      element: <div>hosted object page</div>,
      settingsPermission: 'DATA_MODEL',
    },
  ],
}));

const renderRoutedPage = (path: string | null) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(
        sidePanelRoutedPagePathComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        path,
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
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

describe('SidePanelRoutedPage', () => {
  beforeEach(() => {
    mockHasPermission = true;
    jest.clearAllMocks();
  });

  it('should render the hosted route for the path it was opened with', () => {
    renderRoutedPage('/settings/objects/companies');

    expect(screen.getByText('hosted object page')).toBeInTheDocument();
  });

  it('should not render a hosted route the viewer lacks permission for', () => {
    mockHasPermission = false;

    renderRoutedPage('/settings/objects/companies');

    expect(screen.queryByText('hosted object page')).not.toBeInTheDocument();
    expect(
      screen.getByText('This page is no longer available.'),
    ).toBeInTheDocument();
  });

  it('should render nothing hosted for a path outside the hostable set', () => {
    renderRoutedPage('/settings/billing');

    expect(screen.queryByText('hosted object page')).not.toBeInTheDocument();
    expect(
      screen.getByText('This page is no longer available.'),
    ).toBeInTheDocument();
  });

  it('should render nothing hosted without a path', () => {
    renderRoutedPage(null);

    expect(screen.queryByText('hosted object page')).not.toBeInTheDocument();
  });
});
