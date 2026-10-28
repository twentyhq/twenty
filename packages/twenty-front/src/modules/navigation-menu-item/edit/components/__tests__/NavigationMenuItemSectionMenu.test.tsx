import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <BaseWrapper>
      <MemoryRouter>{children}</MemoryRouter>
    </BaseWrapper>
  </I18nProvider>
);

describe('NavigationMenuItemSectionMenu', () => {
  it('closes once the section name is confirmed with Enter', async () => {
    const user = userEvent.setup();

    render(
      <NavigationMenuItemSectionMenu
        section={buildOptimisticNavigationMenuItem({
          id: 'projects-section',
          type: NavigationMenuItemType.SECTION,
          position: 0,
        })}
      />,
      { wrapper: Wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Section actions' }));
    await user.type(
      await screen.findByRole('textbox', { name: 'Section name' }),
      'Projects{Enter}',
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('textbox', { name: 'Section name' }),
      ).not.toBeInTheDocument(),
    );
  });
});
