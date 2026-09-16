import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { Fragment } from 'react';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconLink } from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { NavigationMenuItemEditable } from '@/navigation-menu-item/edit/components/NavigationMenuItemEditable';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

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
        .map((item, index) => (
          <Fragment key={item.id}>
            <NavigationItemDropTarget
              folderId={null}
              index={index}
              sectionId={NavigationSections.WORKSPACE}
              compact
            />
            <NavigationMenuItemEditable item={item}>
              <NavigationDrawerItem label={item.name ?? ''} Icon={IconLink} />
            </NavigationMenuItemEditable>
          </Fragment>
        ))}
      <NavigationItemDropTarget
        folderId={null}
        index={items.length}
        sectionId={NavigationSections.WORKSPACE}
        compact
      />
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
    ToastDecorator,
  ],
  parameters: { container: { width: 240 } },
  beforeEach: () => {
    jotaiStore.set(selectedNavigationMenuItemIdInEditModeState.atom, null);
    jotaiStore.set(navigationMenuItemIdToRenameState.atom, null);
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    jotaiStore.set(navigationMenuItemsDraftState.atom, ITEMS);
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
    await userEvent.clear(label);
    await userEvent.type(label, 'Documentation{Enter}');
    await expect(await canvas.findByText('Documentation')).toBeVisible();
    await userEvent.click(
      (await canvas.findAllByRole('button', { name: 'Edit link' }))[0],
    );
    const url = await body.findByDisplayValue('https://example.com');
    await userEvent.clear(url);
    await userEvent.type(url, 'https://twenty.com/docs{Enter}');
    await userEvent.click(
      (await canvas.findAllByRole('button', { name: 'Edit link' }))[0],
    );
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

export const PreviewInsertion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.pointer({
      target: await canvas.findByText('Docs'),
      keys: '[MouseRight]',
    });
    await userEvent.click(await body.findByText('Add menu item after'));
    await expect(
      await canvas.findByRole('button', { name: 'Select a menu item' }),
    ).toBeDisabled();
    await expect(
      (await canvas.findAllByText(/^(Docs|Status|Select a menu item)$/)).map(
        (element) => element.textContent,
      ),
    ).toEqual(['Docs', 'Select a menu item', 'Status']);
    await userEvent.click(await body.findByText('Object'));
    await expect(await canvas.findByText('Select a menu item')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.queryByText('Select a menu item'),
    ).not.toBeInTheDocument();
    await userEvent.pointer({
      target: await canvas.findByText('Docs'),
      keys: '[MouseRight]',
    });
    await userEvent.click(await body.findByText('Add menu item before'));
    await expect(
      (await canvas.findAllByText(/^(Docs|Status|Select a menu item)$/)).map(
        (element) => element.textContent,
      ),
    ).toEqual(['Select a menu item', 'Docs', 'Status']);
    await userEvent.click(await body.findByText('Link'));
    await expect(await body.findByDisplayValue('Twenty')).toBeVisible();
    await expect(
      canvas.queryByText('Select a menu item'),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const EditFolderInPlace: Story = {
  beforeEach: () => {
    jotaiStore.set(navigationMenuItemsDraftState.atom, [
      {
        ...ITEMS[0],
        id: 'folder',
        name: 'Projects',
        type: NavigationMenuItemType.FOLDER,
        icon: 'IconFolder',
        color: 'orange',
      },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByText('Projects'));
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.click(await canvas.findByText('Projects'));
    const input = await canvas.findByDisplayValue('Projects');
    await userEvent.clear(input);
    await userEvent.type(input, 'Work{Enter}');
    await userEvent.click(await canvas.findByText('Work'));
    await userEvent.clear(await canvas.findByDisplayValue('Work'));
    await userEvent.type(await canvas.findByRole('textbox'), 'Discard{Escape}');
    await expect(await canvas.findByText('Work')).toBeVisible();
    await userEvent.click(
      await canvas.findByLabelText('Choose icon and color', {
        selector: 'button',
      }),
    );
    await expect(
      await body.findByRole('button', { name: 'Icon123' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const TooltipsStayOutOfActionMenus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const docs = await canvas.findByText('Docs');
    const status = await canvas.findByText('Status');

    await userEvent.hover(docs);
    await expect(await body.findByRole('tooltip')).toHaveTextContent('Link');
    await userEvent.hover(status);
    await expect(await body.findByRole('tooltip')).toHaveTextContent('Link');
    await expect(body.getAllByRole('tooltip')).toHaveLength(1);

    for (const name of ['Docs', 'Status']) {
      await userEvent.tab();
      await userEvent.tab();
      await expect(canvas.getByText(name)).toHaveFocus();
      const actions = (
        await canvas.findAllByRole('button', { name: 'Menu item actions' })
      )[name === 'Docs' ? 0 : 1];
      await userEvent.hover(actions);
      await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
      await userEvent.click(actions);
      await expect(await body.findByText('Remove from sidebar')).toBeVisible();
      await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
    }
  },
};
