import { SidePanelEditColumnShowSelect } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnShowSelect';
import { type SidePanelEditColumnSummaryShowOption } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnSummaryShowOption';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
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

const SUMMARY_SHOW_OPTIONS: SidePanelEditColumnSummaryShowOption[] = [
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
];

const renderShowSelect = async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();

  render(
    <JotaiProvider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <SidePanelEditColumnShowSelect
          dropdownId="edit-column-show"
          relationObjectMetadataItem={opportunityObjectMetadataItem}
          fieldMetadataItems={[
            nameFieldMetadataItem,
            closeDateFieldMetadataItem,
          ]}
          summaryShowOptions={SUMMARY_SHOW_OPTIONS}
          value={null}
          onChange={onChange}
        />
      </I18nProvider>
    </JotaiProvider>,
  );

  await user.click(screen.getByText('Opportunities'));

  return { user, onChange };
};

describe('SidePanelEditColumnShowSelect', () => {
  it('opens the operations of a field in a submenu below the field itself', async () => {
    const { user } = await renderShowSelect();

    await user.click(await screen.findByRole('button', { name: 'Close date' }));

    const dialog = screen.getByRole('dialog');
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
  });

  it('selects a field without summary options directly', async () => {
    const { user, onChange } = await renderShowSelect();

    await user.click(await screen.findByRole('button', { name: 'Name' }));

    expect(onChange).toHaveBeenCalledWith(nameFieldMetadataItem.id);
  });

  it('lists matching operations flat with their field while searching', async () => {
    const { user, onChange } = await renderShowSelect();

    await user.type(await screen.findByLabelText('Search'), 'earliest');

    const dialog = screen.getByRole('dialog');
    const option = await within(dialog).findByRole('button', {
      name: /Earliest of Close date/,
    });
    expect(within(option).getByText('Close date')).toBeVisible();
    expect(within(dialog).getAllByRole('button')).toEqual([option]);

    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('min-close-date');
  });
});
