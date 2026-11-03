import { sanitizeConditionalDisplay } from '@/conditional-display/utils/sanitizeConditionalDisplay';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

const FIELD_METADATA_ITEMS = [
  { id: 'name-field-id', isActive: true },
  { id: 'inactive-field-id', isActive: false },
];

const roleRecordFilter: PersistedRecordFilter = {
  id: 'role-filter',
  fieldMetadataId: 'currentRoleId',
  operand: ViewFilterOperand.IS,
  value: JSON.stringify(['sales-role-id']),
};

const nameRecordFilter: PersistedRecordFilter = {
  id: 'name-filter',
  fieldMetadataId: 'name-field-id',
  operand: ViewFilterOperand.CONTAINS,
  value: 'Air',
};

describe('sanitizeConditionalDisplay', () => {
  it('returns null when the only rows have no value yet', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          { ...roleRecordFilter, value: '' },
          {
            ...roleRecordFilter,
            id: 'member-filter',
            fieldMetadataId: 'currentWorkspaceMemberId',
            value: '',
          },
        ],
        recordFilterGroups: [],
        fieldMetadataItems: [],
      }),
    ).toBeNull();
  });

  it('stores context rows under their context key', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [roleRecordFilter],
        recordFilterGroups: [],
        fieldMetadataItems: [],
      })?.recordFilters,
    ).toEqual([
      {
        id: 'role-filter',
        contextKey: 'currentRoleId',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['sales-role-id']),
      },
    ]);
  });

  it('keeps field rows on active fields and drops rows on inactive or unknown fields', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          nameRecordFilter,
          {
            ...nameRecordFilter,
            id: 'inactive-filter',
            fieldMetadataId: 'inactive-field-id',
          },
          {
            ...nameRecordFilter,
            id: 'deleted-filter',
            fieldMetadataId: 'deleted-field-id',
          },
        ],
        recordFilterGroups: [],
        fieldMetadataItems: FIELD_METADATA_ITEMS,
      })?.recordFilters,
    ).toEqual([
      {
        id: 'name-filter',
        fieldMetadataId: 'name-field-id',
        operand: ViewFilterOperand.CONTAINS,
        value: 'Air',
      },
    ]);
  });

  it('removes groups emptied by dropped context rows and keeps the selectedRecordsMatch', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          { ...roleRecordFilter, recordFilterGroupId: 'root' },
          {
            ...roleRecordFilter,
            id: 'member-filter',
            fieldMetadataId: 'currentWorkspaceMemberId',
            value: '',
            recordFilterGroupId: 'nested',
          },
        ],
        recordFilterGroups: [
          { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
          {
            id: 'nested',
            logicalOperator: RecordFilterGroupLogicalOperator.OR,
            parentRecordFilterGroupId: 'root',
          },
        ],
        selectedRecordsMatch: 'SOME',
        fieldMetadataItems: [],
      }),
    ).toEqual({
      recordFilters: [
        expect.objectContaining({
          id: 'role-filter',
          contextKey: 'currentRoleId',
          recordFilterGroupId: 'root',
        }),
      ],
      recordFilterGroups: [
        { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
      ],
      selectedRecordsMatch: 'SOME',
    });
  });

  it('keeps a group holding only context rows and the original row order next to a dropped deleted-field row', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          { ...nameRecordFilter, recordFilterGroupId: 'root' },
          {
            ...nameRecordFilter,
            id: 'deleted-filter',
            fieldMetadataId: 'deleted-field-id',
            recordFilterGroupId: 'root',
          },
          { ...roleRecordFilter, recordFilterGroupId: 'context-only' },
          {
            ...roleRecordFilter,
            id: 'member-filter',
            fieldMetadataId: 'currentWorkspaceMemberId',
            recordFilterGroupId: 'root',
          },
        ],
        recordFilterGroups: [
          { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
          {
            id: 'context-only',
            logicalOperator: RecordFilterGroupLogicalOperator.OR,
            parentRecordFilterGroupId: 'root',
          },
        ],
        fieldMetadataItems: FIELD_METADATA_ITEMS,
      }),
    ).toEqual({
      recordFilters: [
        expect.objectContaining({ id: 'name-filter' }),
        expect.objectContaining({ id: 'role-filter' }),
        expect.objectContaining({ id: 'member-filter' }),
      ],
      recordFilterGroups: [
        { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
        {
          id: 'context-only',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'root',
        },
      ],
    });
  });
});
