import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const meta: Meta<typeof NavigationMenuItemAddDropdown> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemAddDropdown',
  component: NavigationMenuItemAddDropdown,
  decorators: [
    ComponentWithRouterDecorator,
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    ToastDecorator,
    PermissionFlagsDecorator,
  ],
  parameters: {
    permissionFlags: [PermissionFlagType.WORKFLOWS, PermissionFlagType.AI],
  },
  beforeEach: () => {
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    jotaiStore.set(navigationMenuItemsDraftState.atom, []);
  },
  render: ({ section }) => (
    <NavigationMenuItemAddDropdown
      instanceId="workspace-header"
      section={section}
      position={0}
    >
      <LightIconButton aria-label="Add">
        <IconPlus />
      </LightIconButton>
    </NavigationMenuItemAddDropdown>
  ),
};

export default meta;
type Story = StoryObj<typeof NavigationMenuItemAddDropdown>;

const openAddItemPicker = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const [addTrigger] = await canvas.findAllByRole('button', { name: 'Add' });

  await userEvent.click(addTrigger);

  return within(await body.findByRole('dialog', { name: 'Add item' }));
};

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
    const picker = await body.findByRole('dialog', { name: 'Add item' });

    await waitFor(() => expect(picker).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    await waitFor(() => expect(addButton).toHaveFocus());
  },
};

export const WorkspaceOffersAutomations: Story = {
  args: { section: 'workspace' },
  play: async ({ canvasElement }) => {
    const picker = await openAddItemPicker(canvasElement);

    await expect(await picker.findByText('Automations')).toBeVisible();
  },
};

export const FavoritesHideAutomations: Story = {
  args: { section: 'favorite' },
  play: async ({ canvasElement }) => {
    const picker = await openAddItemPicker(canvasElement);

    await expect(await picker.findByText('Record')).toBeVisible();
    await expect(picker.queryByText('Automations')).not.toBeInTheDocument();
  },
};
