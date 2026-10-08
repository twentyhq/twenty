import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location">{location.pathname}</div>;
};

const linkNavigationMenuItem = {
  id: 'link-item-id',
  type: NavigationMenuItemType.LINK,
  name: 'Q3 deck',
  link: 'https://google.com/search',
  folderId: 'folder-id',
  position: 0,
} as NavigationMenuItem;

describe('NavigationMenuItemFolderSubItem', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens a link item in a new tab instead of routing to its absolute URL', async () => {
    const windowOpen = jest.spyOn(window, 'open').mockImplementation();

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/objects/companies']}>
          <NavigationMenuItemFolderSubItem
            navigationMenuItem={linkNavigationMenuItem}
            index={0}
            arrayLength={1}
            selectedIndex={-1}
            isDragging={false}
          />
          <LocationProbe />
        </MemoryRouter>
      </I18nProvider>,
    );

    await userEvent.click(screen.getByText('Q3 deck'));

    expect(windowOpen).toHaveBeenCalledTimes(1);
    expect(windowOpen).toHaveBeenCalledWith(
      'https://google.com/search',
      '_blank',
      'noopener,noreferrer',
    );
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/objects/companies',
    );
  });
});
