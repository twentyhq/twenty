import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SortViewDecorator } from '~/testing/decorators/SortViewDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { UpdateViewButtonGroup } from '@/views/components/UpdateViewButtonGroup';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';

const meta: Meta<typeof UpdateViewButtonGroup> = {
  title: 'Modules/Views/UpdateViewButtonGroup',
  component: UpdateViewButtonGroup,
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('AggregateCompanies', () =>
          HttpResponse.json({ data: { companies: { totalCount: 1 } } }),
        ),
      ],
    },
  },
  decorators: [
    SortViewDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
    MemoryRouterDecorator,
  ],
  render: () => (
    <>
      <ViewPickerDropdown />
      <UpdateViewButtonGroup />
    </>
  ),
};
export default meta;
type Story = StoryObj<typeof UpdateViewButtonGroup>;

export const CreateView: Story = {
  parameters: { hasSortChanges: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'View update options',
      }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Create view' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    const name = await body.findByRole('textbox');
    await waitFor(() => expect(name).toHaveFocus());
    await expect(body.getByText('Create view')).toBeVisible();
  },
};

export const UnchangedView: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('All Companies');
    await expect(
      within(canvasElement).queryByRole('button', {
        name: 'View update options',
      }),
    ).not.toBeInTheDocument();
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Update view' }),
    ).not.toBeInTheDocument();
  },
};
