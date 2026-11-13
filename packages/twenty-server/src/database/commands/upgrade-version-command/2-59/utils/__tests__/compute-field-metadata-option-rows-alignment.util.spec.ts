import {
  computeFieldMetadataOptionRowsAlignment,
  type EnumFieldToAlign,
  type ExistingFieldMetadataOptionRow,
} from 'src/database/commands/upgrade-version-command/2-59/utils/compute-field-metadata-option-rows-alignment.util';

const FIELD_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-0000000000aa';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const GENERATED_ID = '20202020-0000-4000-8000-0000000000ff';

const openOption = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
};
const closedOption = {
  id: CLOSED_OPTION_ID,
  value: 'CLOSED',
  label: 'Closed',
  color: 'red',
  position: 1,
};

const toRow = ({
  option: { id, ...columns },
  rowId,
}: {
  option: typeof openOption;
  rowId: string;
}): ExistingFieldMetadataOptionRow => ({
  id: rowId,
  universalIdentifier: id,
  fieldMetadataId: FIELD_ID,
  ...columns,
});

const align = ({
  options,
  existingOptionRows,
}: {
  options: EnumFieldToAlign['options'];
  existingOptionRows: ExistingFieldMetadataOptionRow[];
}) =>
  computeFieldMetadataOptionRowsAlignment({
    enumFields: [{ id: FIELD_ID, applicationId: APPLICATION_ID, options }],
    existingOptionRows,
    generateUniversalIdentifier: () => GENERATED_ID,
  });

describe('computeFieldMetadataOptionRowsAlignment', () => {
  it('changes nothing when every option has its row', () => {
    expect(
      align({
        options: [openOption, closedOption],
        existingOptionRows: [
          toRow({ option: openOption, rowId: 'row-open' }),
          toRow({ option: closedOption, rowId: 'row-closed' }),
        ],
      }),
    ).toEqual({
      optionRowsToInsert: [],
      optionRowsToUpdate: [],
      optionRowIdsToDelete: [],
    });
  });

  it('inserts the missing row, updates the different one and deletes the unknown one', () => {
    expect(
      align({
        options: [{ ...openOption, label: 'Opened' }, closedOption],
        existingOptionRows: [
          toRow({ option: openOption, rowId: 'row-open' }),
          toRow({
            option: { ...closedOption, id: GENERATED_ID, value: 'ARCHIVED' },
            rowId: 'row-archived',
          }),
        ],
      }),
    ).toEqual({
      optionRowsToInsert: [
        {
          universalIdentifier: CLOSED_OPTION_ID,
          fieldMetadataId: FIELD_ID,
          applicationId: APPLICATION_ID,
          value: 'CLOSED',
          label: 'Closed',
          color: 'red',
          position: 1,
        },
      ],
      optionRowsToUpdate: [
        {
          id: 'row-open',
          value: 'OPEN',
          label: 'Opened',
          color: 'green',
          position: 0,
        },
      ],
      optionRowIdsToDelete: ['row-archived'],
    });
  });

  it('keeps the row that holds the value under another id', () => {
    expect(
      align({
        options: [{ ...openOption, label: 'Opened' }],
        existingOptionRows: [
          toRow({
            option: { ...openOption, id: GENERATED_ID },
            rowId: 'row-open',
          }),
        ],
      }),
    ).toEqual({
      optionRowsToInsert: [],
      optionRowsToUpdate: [
        {
          id: 'row-open',
          value: 'OPEN',
          label: 'Opened',
          color: 'green',
          position: 0,
        },
      ],
      optionRowIdsToDelete: [],
    });
  });

  it('gives a new id to an option whose id cannot be a universal identifier, and skips a repeated value', () => {
    expect(
      align({
        options: [
          { ...openOption, id: 'ABCDEF12-0000-4000-8000-000000000101' },
          { ...closedOption, value: 'OPEN' },
        ],
        existingOptionRows: [],
      }).optionRowsToInsert,
    ).toEqual([
      {
        universalIdentifier: GENERATED_ID,
        fieldMetadataId: FIELD_ID,
        applicationId: APPLICATION_ID,
        value: 'OPEN',
        label: 'Open',
        color: 'green',
        position: 0,
      },
    ]);
  });
});
