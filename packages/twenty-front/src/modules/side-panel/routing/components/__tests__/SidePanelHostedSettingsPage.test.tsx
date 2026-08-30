import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';

import { SidePanelRoutedPage } from '@/side-panel/routing/components/SidePanelRoutedPage';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => true,
}));

const renderHostedSettingsPage = (path: string) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      // The panel only exists behind a session, and its gate checks for one.
      store.set(isCookieAuthActiveState.atom, true);
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

// The point of hosting routes is that the panel shows the real settings page
// rather than a second implementation of it, so this renders the actual one.
describe('a settings page hosted in the side panel', () => {
  it('should render the real object settings page', async () => {
    renderHostedSettingsPage(
      `/settings/objects/${companyObjectMetadataItem.namePlural}`,
    );

    expect(
      await screen.findAllByText(
        nameFieldMetadataItem.label,
        {},
        // The hosted route is loaded lazily, as the main route tree loads it.
        { timeout: 10000 },
      ),
    ).not.toHaveLength(0);
  });

  it('should leave the full page header to the panel top bar', async () => {
    renderHostedSettingsPage(
      `/settings/objects/${companyObjectMetadataItem.namePlural}`,
    );

    await screen.findAllByText(
      nameFieldMetadataItem.label,
      {},
      { timeout: 10000 },
    );

    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('See records')).not.toBeInTheDocument();
  });
});
