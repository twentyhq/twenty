import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { NavigationMenuContainerEditableItems } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

jest.mock(
  '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListDndKit',
  () => ({
    WorkspaceSectionListDndKit: () => <div>Drag and drop list</div>,
  }),
);
jest.mock(
  '@/navigation-menu-item/display/components/NavigationMenuItemDisplay',
  () => ({
    NavigationMenuItemDisplay: ({ item }: { item: NavigationMenuItem }) => (
      <div data-testid="entry">{item.name}</div>
    ),
  }),
);
jest.mock(
  '@/navigation-menu-item/edit/hooks/useEditModeNavigationMenuItemClick',
  () => ({ useEditModeNavigationMenuItemClick: () => jest.fn() }),
);

const buildItem = (
  name: string,
  type: NavigationMenuItemType,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id: name,
  name,
  type,
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
});

describe('NavigationMenuContainerEditableItems', () => {
  it('renders sections among items while the drag and drop list loads', () => {
    render(
      <JotaiProvider store={createStore()}>
        <NavigationMenuContainerEditableItems
          containerId={null}
          topLevelItems={[
            buildItem('Companies', NavigationMenuItemType.OBJECT),
            buildItem('Inbox', NavigationMenuItemType.SECTION),
            buildItem('People', NavigationMenuItemType.OBJECT),
            buildItem('Favorites', NavigationMenuItemType.SECTION),
          ]}
          folderChildrenById={new Map()}
          renderSection={(section) => (
            <div data-testid="entry">{`${section.name} section`}</div>
          )}
        />
      </JotaiProvider>,
    );

    expect(screen.queryByText('Drag and drop list')).not.toBeInTheDocument();
    expect(
      screen.getAllByTestId('entry').map((entry) => entry.textContent),
    ).toEqual(['Companies', 'Inbox section', 'People', 'Favorites section']);
  });
});
