import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SortViewDecorator } from '~/testing/decorators/SortViewDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';

const meta: Meta<typeof ObjectSortDropdownButton> = {
  title: 'Modules/ObjectSortDropdown/ObjectSortDropdownButton',
  component: ObjectSortDropdownButton,
  decorators: [
    SortViewDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
    MemoryRouterDecorator,
  ],
};
export default meta;
type Story = StoryObj<typeof ObjectSortDropdownButton>;

export const SearchAndDirection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Sort' });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByText('Visible fields')).toBeVisible());
    await expect(body.getByText('Hidden fields')).toBeVisible();
    await expect(body.getByTestId('visible-select-sort-0')).toBeVisible();
    await expect(body.getByTestId('hidden-select-sort-0')).toBeVisible();
    await userEvent.click(body.getByRole('button', { name: 'Ascending' }));
    await userEvent.click(
      await body.findByRole('button', { name: 'Descending' }),
    );
    await expect(body.getByRole('dialog', { name: 'Sort' })).toBeVisible();
    const direction = body.getByRole('button', { name: 'Descending' });
    await userEvent.click(direction);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(direction).toHaveFocus());
    await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(1));
    await userEvent.click(direction);
    await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(2));
    await userEvent.click(canvasElement);
    await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(1));
    const search = body.getByRole('searchbox', { name: 'Search fields' });
    await userEvent.type(search, 'Tagline');
    await expect(body.queryByText('Visible fields')).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await expect(
      await body.findByRole('button', { name: 'Ascending' }),
    ).toBeVisible();
    await expect(body.getByRole('searchbox')).toHaveValue('');
    await userEvent.type(body.getByRole('searchbox'), 'Name');
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await expect(await body.findByRole('searchbox')).toHaveValue('');
  },
};
