import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <BaseWrapper>
      <MemoryRouter initialEntries={['/objects/companies']}>
        {children}
      </MemoryRouter>
    </BaseWrapper>
  </I18nProvider>
);

describe('WorkspaceSectionContainer', () => {
  it('keeps the section and its right icon reachable when there are no items', () => {
    render(
      <WorkspaceSectionContainer
        sectionTitle="Workspace"
        items={[]}
        rightIcon={<button type="button">Customize</button>}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Customize' }),
    ).toBeInTheDocument();
  });

  it('hides a section whose items are all hidden', () => {
    render(
      <WorkspaceSectionContainer
        sectionTitle="Projects"
        items={[
          buildOptimisticNavigationMenuItem({
            id: 'empty-folder',
            type: NavigationMenuItemType.FOLDER,
            name: 'Empty folder',
            folderId: 'projects-section',
            position: 0,
          }),
        ]}
        containerId="projects-section"
        navigationSectionId="projects-section"
        isHiddenWhenEmpty
      />,
      { wrapper: Wrapper },
    );

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
  });

  it('lists items up to its limit and reveals the rest with See more', async () => {
    const user = userEvent.setup();
    const links = Array.from({ length: 7 }, (_, index) =>
      buildOptimisticNavigationMenuItem({
        id: `link-${index + 1}`,
        type: NavigationMenuItemType.LINK,
        name: `Link ${index + 1}`,
        link: `https://example.com/${index + 1}`,
        folderId: 'links-section',
        position: index,
      }),
    );

    render(
      <WorkspaceSectionContainer
        sectionTitle="Links"
        items={links}
        containerId="links-section"
        navigationSectionId="links-section"
        visibleItemLimit={5}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Link 5')).toBeInTheDocument();
    expect(screen.queryByText('Link 6')).not.toBeInTheDocument();

    await user.click(screen.getByText('See more'));

    expect(screen.getByText('Link 7')).toBeInTheDocument();

    await user.click(screen.getByText('See less'));

    expect(screen.queryByText('Link 6')).not.toBeInTheDocument();
  });
});
