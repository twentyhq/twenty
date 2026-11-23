import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { NavigationMenuSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenu';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const CUSTOM_SECTION: NavigationMenuItem = {
  id: 'sales-section',
  type: NavigationMenuItemType.SECTION,
  name: 'Sales',
  position: 0,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const BUILT_IN_SECTION: NavigationMenuItem = {
  ...CUSTOM_SECTION,
  id: 'favorites-section',
  name: null,
  position: 1,
  builtInSectionKey: 'favorites',
};

const meta: Meta<typeof NavigationMenuSectionMenu> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuSectionMenu',
  component: NavigationMenuSectionMenu,
  decorators: [
    ComponentWithRouterDecorator,
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    ToastDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    jotaiStore.set(navigationMenuItemsDraftState.atom, [
      CUSTOM_SECTION,
      BUILT_IN_SECTION,
    ]);
  },
  args: { section: CUSTOM_SECTION },
};

export default meta;
type Story = StoryObj<typeof NavigationMenuSectionMenu>;

export const AddItemOpensThePicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Section actions' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Add item' }),
    );

    await waitFor(async () =>
      expect(await body.findByText('Folder')).toBeVisible(),
    );
    await expect(body.getByText('Add item')).toBeVisible();
  },
};

export const BuiltInSectionHasNoAddItem: Story = {
  args: { section: BUILT_IN_SECTION },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Section actions' }),
    );

    await expect(
      await body.findByRole('menuitem', { name: 'Remove section' }),
    ).toBeVisible();
    await expect(
      body.queryByRole('menuitem', { name: 'Add item' }),
    ).not.toBeInTheDocument();
  },
};
