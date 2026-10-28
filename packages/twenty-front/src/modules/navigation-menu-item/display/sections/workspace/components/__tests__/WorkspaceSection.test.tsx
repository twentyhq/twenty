import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { WorkspaceSection } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSection';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const renderWorkspaceSection = (navigationMenuItems: NavigationMenuItem[]) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) =>
      store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
        current: navigationMenuItems,
        draft: [],
        status: 'up-to-date',
      }),
  });

  render(<WorkspaceSection />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider i18n={i18n}>
        <BaseWrapper>
          <MemoryRouter initialEntries={['/objects/companies']}>
            {children}
          </MemoryRouter>
        </BaseWrapper>
      </I18nProvider>
    ),
  });
};

describe('WorkspaceSection', () => {
  it('keeps the links an app placed outside the Workspace section', () => {
    renderWorkspaceSection([
      buildOptimisticNavigationMenuItem({
        id: 'workspace-section',
        type: NavigationMenuItemType.SECTION,
        name: 'Workspace',
        position: 0,
      }),
      buildOptimisticNavigationMenuItem({
        id: 'roadmap-link',
        type: NavigationMenuItemType.LINK,
        name: 'Roadmap',
        link: 'https://example.com/roadmap',
        folderId: 'workspace-section',
        position: 0,
      }),
      buildOptimisticNavigationMenuItem({
        id: 'templates-link',
        type: NavigationMenuItemType.LINK,
        name: 'Templates',
        link: 'https://example.com/templates',
        position: 1,
      }),
    ]);

    expect(screen.getByText('Roadmap')).toBeVisible();
    expect(screen.getByText('Templates')).toBeVisible();
  });
});
