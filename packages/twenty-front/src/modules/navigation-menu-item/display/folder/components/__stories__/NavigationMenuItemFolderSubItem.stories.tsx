import { type Meta, type StoryObj } from '@storybook/react-vite';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof NavigationMenuItemFolderSubItem> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemFolderSubItem',
  component: NavigationMenuItemFolderSubItem,
  decorators: [
    ComponentDecorator,
    IconsProviderDecorator,
    MemoryRouterDecorator,
    ToastDecorator,
  ],
  parameters: { container: { width: 240 } },
  args: {
    index: 0,
    arrayLength: 1,
    selectedIndex: -1,
    isDragging: false,
  },
};

export default meta;
type Story = StoryObj<typeof NavigationMenuItemFolderSubItem>;

export const Link: Story = {
  args: {
    navigationMenuItem: {
      id: '71c0a705-a53f-4e86-a2ba-4da7ae347c5d',
      folderId: '6194edbc-ae3b-4c7c-b6ea-41ea28edc242',
      type: NavigationMenuItemType.LINK,
      name: 'Example website',
      link: 'https://example.com',
      position: 0,
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-01T12:00:00.000Z',
    },
  },
};
