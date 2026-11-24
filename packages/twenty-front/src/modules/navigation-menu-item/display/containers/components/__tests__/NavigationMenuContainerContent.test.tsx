import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { NavigationMenuContainerContent } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerContent';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems',
);
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
);
jest.mock(
  '@/navigation-menu-item/display/hooks/useSelectActiveNavigationMenuItemInEditMode',
  () => ({ useSelectActiveNavigationMenuItemInEditMode: () => jest.fn() }),
);
jest.mock(
  '@/navigation-menu-item/display/containers/components/NavigationMenuSectionRenderer',
  () => ({
    NavigationMenuSectionRenderer: ({
      section,
    }: {
      section: NavigationMenuItem;
    }) => <div data-testid="block">{section.name}</div>,
  }),
);
jest.mock(
  '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly',
  () => ({
    WorkspaceSectionListReadOnly: ({
      filteredItems,
    }: {
      filteredItems: NavigationMenuItem[];
    }) => (
      <div data-testid="block">
        {filteredItems.map((item) => item.name).join(', ')}
      </div>
    ),
  }),
);
jest.mock(
  '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems',
  () => ({ NavigationMenuContainerEditableItems: () => null }),
);
jest.mock(
  '@/navigation-menu-item/edit/components/NavigationMenuAddSectionButton',
  () => ({ NavigationMenuAddSectionButton: () => null }),
);

const buildChild = ({
  id,
  type,
  position,
}: Pick<
  NavigationMenuItem,
  'id' | 'type' | 'position'
>): NamedNavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id,
  name: id,
  type,
  position,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
});

const renderContainer = ({
  items,
  sections,
}: {
  items: NavigationMenuItem[];
  sections: NamedNavigationMenuItem[];
}) => {
  jest.mocked(useNavigationMenuContainerItems).mockReturnValue({
    topLevelItems: items,
    folderChildrenById: new Map(),
  });
  jest.mocked(useWorkspaceNavigationMenuContainers).mockReturnValue(sections);

  render(
    <JotaiProvider store={createStore()}>
      <NavigationMenuContainerContent containerId={null} />
    </JotaiProvider>,
  );

  return screen.getAllByTestId('block').map((block) => block.textContent);
};

describe('NavigationMenuContainerContent', () => {
  it('renders sections between runs of items in position order', () => {
    expect(
      renderContainer({
        items: [
          buildChild({
            id: 'People',
            type: NavigationMenuItemType.OBJECT,
            position: 3,
          }),
          buildChild({
            id: 'Companies',
            type: NavigationMenuItemType.OBJECT,
            position: 0,
          }),
          buildChild({
            id: 'Tasks',
            type: NavigationMenuItemType.OBJECT,
            position: 4,
          }),
        ],
        sections: [
          buildChild({
            id: 'Sales',
            type: NavigationMenuItemType.SECTION,
            position: 1,
          }),
          buildChild({
            id: 'Support',
            type: NavigationMenuItemType.SECTION,
            position: 2,
          }),
        ],
      }),
    ).toEqual(['Companies', 'Sales', 'Support', 'People, Tasks']);
  });

  it('renders an item before a section sharing its position', () => {
    expect(
      renderContainer({
        items: [
          buildChild({
            id: 'Companies',
            type: NavigationMenuItemType.OBJECT,
            position: 1,
          }),
        ],
        sections: [
          buildChild({
            id: 'Sales',
            type: NavigationMenuItemType.SECTION,
            position: 1,
          }),
        ],
      }),
    ).toEqual(['Companies', 'Sales']);
  });
});
