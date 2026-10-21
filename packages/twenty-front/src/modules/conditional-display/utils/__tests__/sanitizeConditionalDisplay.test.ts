import { sanitizeConditionalDisplay } from '@/conditional-display/utils/sanitizeConditionalDisplay';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import {
  type ConditionalDisplayContextKey,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

const AVAILABLE_CONTEXT_KEYS: ConditionalDisplayContextKey[] = [
  'currentRoleId',
  'currentWorkspaceMemberId',
];

const FIELD_METADATA_ITEMS = [
  { id: 'name-field-id', isActive: true },
  { id: 'inactive-field-id', isActive: false },
];

const roleRecordFilter: PersistedRecordFilter = {
  id: 'role-filter',
  contextKey: 'currentRoleId',
  fieldMetadataId: '',
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
  it('returns null when no rule row is left', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [],
        recordFilterGroups: [],
        availableContextKeys: AVAILABLE_CONTEXT_KEYS,
        fieldMetadataItems: [],
      }),
    ).toBeNull();
  });

  it('returns null when the only rows have no value yet', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          { ...roleRecordFilter, value: '' },
          {
            ...roleRecordFilter,
            id: 'member-filter',
            contextKey: 'currentWorkspaceMemberId',
            value: '',
          },
        ],
        recordFilterGroups: [],
        availableContextKeys: AVAILABLE_CONTEXT_KEYS,
        fieldMetadataItems: [],
      }),
    ).toBeNull();
  });

  it('drops rows on context keys the surface does not offer', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          roleRecordFilter,
          {
            ...roleRecordFilter,
            id: 'device-filter',
            contextKey: 'device',
            value: JSON.stringify(['MOBILE']),
          },
        ],
        recordFilterGroups: [],
        availableContextKeys: AVAILABLE_CONTEXT_KEYS,
        fieldMetadataItems: [],
      })?.recordFilters,
    ).toEqual([expect.objectContaining({ id: 'role-filter' })]);
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
        availableContextKeys: AVAILABLE_CONTEXT_KEYS,
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

  it('removes groups emptied by dropped context rows and keeps the quantifier', () => {
    expect(
      sanitizeConditionalDisplay({
        recordFilters: [
          { ...roleRecordFilter, recordFilterGroupId: 'root' },
          {
            ...roleRecordFilter,
            id: 'member-filter',
            contextKey: 'currentWorkspaceMemberId',
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
        quantifier: 'SOME',
        availableContextKeys: AVAILABLE_CONTEXT_KEYS,
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
      quantifier: 'SOME',
    });
  });
});
