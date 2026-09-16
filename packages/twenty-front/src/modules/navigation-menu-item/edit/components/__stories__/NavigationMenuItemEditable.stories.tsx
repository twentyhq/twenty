import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconLink } from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { NavigationMenuItemEditable } from '@/navigation-menu-item/edit/components/NavigationMenuItemEditable';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const ITEMS: NavigationMenuItem[] = ['Docs', 'Status'].map(
  (name, position) => ({
    id: name.toLowerCase(),
    type: NavigationMenuItemType.LINK,
    name,
    link: 'https://example.com',
    position,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
);

const EditableNavigation = () => {
  const items = useAtomStateValue(navigationMenuItemsDraftState) ?? [];
  return (
    <>
      {[...items]
        .sort((a, b) => a.position - b.position)
        .map((item) => (
          <NavigationMenuItemEditable key={item.id} item={item}>
            <NavigationDrawerItem label={item.name ?? ''} Icon={IconLink} />
          </NavigationMenuItemEditable>
        ))}
    </>
  );
};

const meta: Meta<typeof NavigationMenuItemEditable> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemEditable',
  component: NavigationMenuItemEditable,
  decorators: [
    ComponentWithRouterDecorator,
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    SnackBarDecorator,
  ],
  parameters: { container: { width: 240 } },
  beforeEach: () => {
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    jotaiStore.set(navigationMenuItemsDraftState.atom, ITEMS);
    jotaiStore.set(navigationMenuItemEditSectionState.atom, 'workspace');
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
  },
  render: () => <EditableNavigation />,
};
export default meta;
type Story = StoryObj<typeof NavigationMenuItemEditable>;

export const EditLink: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByText('Docs'));
    const label = await body.findByDisplayValue('Docs');
    const url = await body.findByDisplayValue('https://example.com');
    await userEvent.clear(label);
    await userEvent.type(label, 'Documentation');
    await userEvent.clear(url);
    await userEvent.type(url, 'https://twenty.com/docs{Enter}');
    await expect(await canvas.findByText('Documentation')).toBeVisible();
    await userEvent.click(await canvas.findByText('Documentation'));
    await expect(
      await body.findByDisplayValue('https://twenty.com/docs'),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const OrganizeFromBothMenus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const docs = await canvas.findByText('Docs');
    await userEvent.tab();
    await userEvent.click(
      (await canvas.findAllByRole('button', { name: 'Menu item actions' }))[0],
    );
    await userEvent.click(await body.findByText('Move down'));
    await expect(
      (await canvas.findAllByText(/^(Docs|Status)$/)).map(
        (button) => button.textContent,
      ),
    ).toEqual(['Status', 'Docs']);
    await userEvent.pointer({ target: docs, keys: '[MouseRight]' });
    await expect(await body.findByText('Add menu item before')).toBeVisible();
    await expect(await body.findByText('Add menu item after')).toBeVisible();
    await expect(await body.findByText('Move to folder')).toBeVisible();
    await userEvent.click(await body.findByText('Remove from sidebar'));
    await expect(canvas.queryByText('Docs')).not.toBeInTheDocument();
    await expect(await canvas.findByText('Status')).toBeVisible();
  },
};
