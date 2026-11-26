import { SidePanelEditColumnShowSelect } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnShowSelect';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AggregateOperations } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'name',
});
const closeDateFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'closeDate',
});

const meta: Meta<typeof SidePanelEditColumnShowSelect> = {
  title: 'Modules/SidePanel/EditColumn/SidePanelEditColumnShowSelect',
  component: SidePanelEditColumnShowSelect,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'edit-column-show',
    relationObjectMetadataItem: opportunityObjectMetadataItem,
    fieldMetadataItems: [nameFieldMetadataItem, closeDateFieldMetadataItem],
    summaryShowOptions: [
      {
        aggregateOperation: AggregateOperations.COUNT,
        relationTargetFieldMetadataId: null,
        label: 'Count of Opportunities',
        operationLabel: 'Count',
        value: 'count',
      },
      {
        aggregateOperation: AggregateOperations.MIN,
        relationTargetFieldMetadataId: closeDateFieldMetadataItem.id,
        label: 'Earliest of Close date',
        operationLabel: 'Earliest',
        value: 'min-close-date',
      },
      {
        aggregateOperation: AggregateOperations.MAX,
        relationTargetFieldMetadataId: closeDateFieldMetadataItem.id,
        label: 'Latest of Close date',
        operationLabel: 'Latest',
        value: 'max-close-date',
      },
    ],
    value: null,
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SidePanelEditColumnShowSelect>;

const openShowSelect = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    await within(canvasElement).findByRole('button', {
      name: 'Opportunities',
    }),
  );

  return within(canvasElement.ownerDocument.body).findByRole('dialog');
};

export const FieldOperationsSubmenu: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openShowSelect(canvasElement);

    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Close date' }),
    );

    await within(dialog).findByRole('button', { name: 'Close date, back' });
    const [fieldSection, operationSection] =
      within(dialog).getAllByRole('group');
    expect(
      within(fieldSection)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Close date']);
    expect(within(dialog).getAllByRole('separator')).toHaveLength(1);
    expect(
      within(operationSection)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Earliest', 'Latest']);
    await userEvent.keyboard('{Escape}');
  },
};

export const SingleEntryOpensOnItsOperations: Story = {
  args: {
    fieldMetadataItems: [],
    summaryShowOptions: [
      {
        aggregateOperation: AggregateOperations.COUNT,
        relationTargetFieldMetadataId: null,
        label: 'Count of Opportunities',
        operationLabel: 'Count',
        value: 'count',
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const dialog = await openShowSelect(canvasElement);

    await waitFor(() =>
      expect(
        within(dialog)
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual(['Opportunities', 'Count']),
    );
    expect(within(dialog).queryByLabelText('Search')).not.toBeInTheDocument();

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Count' }),
    );

    expect(args.onChange).toHaveBeenCalledWith('count');
  },
};

export const SelectFieldWithoutOperations: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await openShowSelect(canvasElement);

    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Name' }),
    );

    expect(args.onChange).toHaveBeenCalledWith(nameFieldMetadataItem.id);
  },
};

export const SearchOperations: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await openShowSelect(canvasElement);

    await userEvent.type(within(dialog).getByLabelText('Search'), 'earliest');

    const option = await within(dialog).findByRole('button', {
      name: /Earliest of Close date/,
    });
    await waitFor(() =>
      expect(within(dialog).getAllByRole('button')).toEqual([option]),
    );
    expect(within(option).getByText('Close date')).toBeVisible();

    await userEvent.click(option);

    expect(args.onChange).toHaveBeenCalledWith('min-close-date');
  },
};
