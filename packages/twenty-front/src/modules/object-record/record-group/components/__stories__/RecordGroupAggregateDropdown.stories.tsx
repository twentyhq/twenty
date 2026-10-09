import { RecordGroupAggregateDropdown } from '@/object-record/record-group/components/RecordGroupAggregateDropdown';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const company = getTestEnrichedObjectMetadataItemsMock().find(
  (object) => object.nameSingular === 'company',
)!;

const meta: Meta<typeof RecordGroupAggregateDropdown> = {
  title: 'Modules/ObjectRecord/RecordGroup/RecordGroupAggregateDropdown',
  component: RecordGroupAggregateDropdown,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: {
    objectMetadataItem: company,
    aggregateValue: 42,
    aggregateLabel: 'Count all',
    dropdownId: 'record-group-aggregate-story',
  },
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordGroupAggregateDropdown>;

export const NavigateSelectAndReset: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: '42' });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    for (const name of ['Count', 'Percent', 'Date', 'More options']) {
      expect(within(popup).getByRole('button', { name })).toBeVisible();
    }
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Percent' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Percent empty' }),
    );
    await within(popup).findByRole('button', { name: 'Name' });
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Percent empty' }),
    );
    expect(
      await within(popup).findByRole('button', { name: 'Percent' }),
    ).toBeVisible();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Percent' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Count' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Count all' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: 'Date' }));
    await userEvent.click(
      await body.findByRole('button', { name: 'Earliest date' }),
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'Creation date' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: 'More options' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
