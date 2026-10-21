import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
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

export const AddMenuResetsOnClose: Story = {
  decorators: [ObjectMetadataItemsDecorator],
  args: {
    ...Link.args,
    rightOptions: (
      <NavigationMenuItemFolderNavigationDrawerItemDropdown
        folderId="6194edbc-ae3b-4c7c-b6ea-41ea28edc242"
        itemCount={1}
        onEdit={fn()}
        onDelete={fn()}
      />
    ),
  },
  beforeEach: () => {
    jotaiStore.set(openNavigationMenuItemFolderIdsState.atom, []);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(await canvas.findByText('Example website'));
    const options = await canvas.findByRole('button', { name: 'More options' });
    await userEvent.click(options);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Add menu item' }),
    );
    await expect(
      jotaiStore.get(openNavigationMenuItemFolderIdsState.atom),
    ).toContain('6194edbc-ae3b-4c7c-b6ea-41ea28edc242');
    await expect(await body.findByPlaceholderText('Search...')).toBeVisible();
    await waitFor(() =>
      expect(body.getByPlaceholderText('Search...')).toHaveFocus(),
    );
    await userEvent.click(await body.findByRole('button', { name: 'Close' }));
    await userEvent.hover(canvas.getByText('Example website'));
    await userEvent.click(options);
    await expect(
      await body.findByRole('menuitem', { name: 'Edit' }),
    ).toBeVisible();
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Add menu item' }),
    );
    await userEvent.keyboard('{Escape}');
    await userEvent.hover(canvas.getByText('Example website'));
    await userEvent.click(options);
    await expect(
      await body.findByRole('menuitem', { name: 'Remove from sidebar' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
