import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { NavigationMenuItemAddDropdownForm } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownForm';

const meta: Meta<typeof NavigationMenuItemAddDropdownForm> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemAddDropdownForm',
  component: NavigationMenuItemAddDropdownForm,
  decorators: [
    ComponentDecorator,
    IconsProviderDecorator,
    MemoryRouterDecorator,
  ],
  parameters: { container: { width: 320 } },
  args: { onAdd: fn(), isFolder: true },
};
export default meta;
type Story = StoryObj<typeof NavigationMenuItemAddDropdownForm>;

export const Folder: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const name = await canvas.findByRole('textbox', { name: 'Name' });
    await userEvent.type(name, 'Research{enter}');
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await expect(args.onAdd).toHaveBeenCalledWith({
      type: NavigationMenuItemType.FOLDER,
      name: 'Research',
      color: 'orange',
      icon: 'IconFolder',
    });
  },
};

export const Link: Story = {
  args: { isFolder: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const url = await canvas.findByRole('textbox', { name: 'URL' });
    await userEvent.type(url, 'not a url{enter}');
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Enter a valid URL',
    );
    await expect(args.onAdd).not.toHaveBeenCalled();
    await userEvent.clear(url);
    await userEvent.type(url, 'example.com{enter}');
    await expect(args.onAdd).toHaveBeenCalledWith({
      type: NavigationMenuItemType.LINK,
      name: 'example.com',
      link: 'https://example.com',
    });
  },
};
