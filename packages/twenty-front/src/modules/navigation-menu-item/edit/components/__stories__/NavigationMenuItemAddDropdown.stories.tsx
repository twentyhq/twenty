import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { LightIconButton } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof NavigationMenuItemAddDropdown> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemAddDropdown',
  component: NavigationMenuItemAddDropdown,
  decorators: [
    ComponentWithRouterDecorator,
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    ToastDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    jotaiStore.set(navigationMenuItemsDraftState.atom, []);
  },
  render: () => (
    <NavigationMenuItemAddDropdown instanceId="workspace-header" position={0}>
      <LightIconButton aria-label="Add">
        <IconPlus />
      </LightIconButton>
    </NavigationMenuItemAddDropdown>
  ),
};

export default meta;
type Story = StoryObj<typeof NavigationMenuItemAddDropdown>;

export const AddButtonIsTheOnlyTabStop: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const addButton = (
      await canvas.findAllByRole('button', { name: 'Add' })
    ).find((button) => button.tagName === 'BUTTON');

    await userEvent.tab();
    await expect(addButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const picker = await body.findByRole('dialog', { name: 'Add menu item' });

    await waitFor(() => expect(picker).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    await waitFor(() => expect(addButton).toHaveFocus());
  },
};
