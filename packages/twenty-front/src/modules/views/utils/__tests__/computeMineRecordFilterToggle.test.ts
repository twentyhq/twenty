import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { computeMineRecordFilterToggle } from '@/views/utils/computeMineRecordFilterToggle';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const OTHER_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

const relationField = {
  id: 'owner-field-id',
  label: 'Account Owner',
  type: FieldMetadataType.RELATION,
} as FieldMetadataItem;

const actorField = {
  id: 'created-by-field-id',
  label: 'Created by',
  type: FieldMetadataType.ACTOR,
} as FieldMetadataItem;

const buildRecordFilter = (
  overrides: Partial<RecordFilter> & Pick<RecordFilter, 'value'>,
): RecordFilter => ({
  id: 'existing-filter-id',
  fieldMetadataId: relationField.id,
  displayValue: '',
  type: 'RELATION',
  operand: ViewFilterOperand.IS,
  label: relationField.label,
  ...overrides,
});

const relationValue = (
  isCurrentWorkspaceMemberSelected: boolean,
  selectedRecordIds: string[],
) => JSON.stringify({ isCurrentWorkspaceMemberSelected, selectedRecordIds });

describe('computeMineRecordFilterToggle', () => {
  it('adds a "Me" filter when the field has no filter', () => {
    expect(
      computeMineRecordFilterToggle({
        currentRecordFilters: [],
        mineFilterFieldMetadataItem: relationField,
        newRecordFilterId: 'new-filter-id',
      }),
    ).toEqual({
      isMineSelected: false,
      toggleAction: {
        type: 'upsert',
        recordFilter: {
          id: 'new-filter-id',
          fieldMetadataId: relationField.id,
          value: relationValue(true, []),
          displayValue: 'Me',
          type: 'RELATION',
          operand: ViewFilterOperand.IS,
          label: relationField.label,
          subFieldName: undefined,
        },
      },
    });
  });

  it('adds a "Me" filter on the workspaceMemberId sub field of an actor field', () => {
    const { toggleAction } = computeMineRecordFilterToggle({
      currentRecordFilters: [],
      mineFilterFieldMetadataItem: actorField,
      newRecordFilterId: 'new-filter-id',
    });

    expect(toggleAction).toMatchObject({
      type: 'upsert',
      recordFilter: {
        fieldMetadataId: actorField.id,
        type: 'ACTOR',
        subFieldName: 'workspaceMemberId',
      },
    });
  });

  it('merges "Me" into an existing filter on the same field', () => {
    const existingRecordFilter = buildRecordFilter({
      value: relationValue(false, [OTHER_MEMBER_ID]),
      displayValue: 'Aaron Munoz',
    });

    expect(
      computeMineRecordFilterToggle({
        currentRecordFilters: [existingRecordFilter],
        mineFilterFieldMetadataItem: relationField,
        newRecordFilterId: 'new-filter-id',
      }),
    ).toEqual({
      isMineSelected: false,
      toggleAction: {
        type: 'upsert',
        recordFilter: {
          ...existingRecordFilter,
          value: relationValue(true, [OTHER_MEMBER_ID]),
          displayValue: 'Me, Aaron Munoz',
        },
      },
    });
  });

  it('removes only "Me" when other members stay selected', () => {
    const existingRecordFilter = buildRecordFilter({
      value: relationValue(true, [OTHER_MEMBER_ID]),
      displayValue: 'Me, Aaron Munoz',
    });

    expect(
      computeMineRecordFilterToggle({
        currentRecordFilters: [existingRecordFilter],
        mineFilterFieldMetadataItem: relationField,
        newRecordFilterId: 'new-filter-id',
      }),
    ).toEqual({
      isMineSelected: true,
      toggleAction: {
        type: 'upsert',
        recordFilter: {
          ...existingRecordFilter,
          value: relationValue(false, [OTHER_MEMBER_ID]),
          displayValue: 'Aaron Munoz',
        },
      },
    });
  });

  it('removes the filter when "Me" is its only value', () => {
    expect(
      computeMineRecordFilterToggle({
        currentRecordFilters: [
          buildRecordFilter({ value: relationValue(true, []) }),
        ],
        mineFilterFieldMetadataItem: relationField,
        newRecordFilterId: 'new-filter-id',
      }),
    ).toEqual({
      isMineSelected: true,
      toggleAction: { type: 'remove', recordFilterId: 'existing-filter-id' },
    });
  });

  it('reads the legacy array value format', () => {
    const { toggleAction } = computeMineRecordFilterToggle({
      currentRecordFilters: [
        buildRecordFilter({ value: JSON.stringify([OTHER_MEMBER_ID]) }),
      ],
      mineFilterFieldMetadataItem: relationField,
      newRecordFilterId: 'new-filter-id',
    });

    expect(toggleAction).toMatchObject({
      type: 'upsert',
      recordFilter: {
        id: 'existing-filter-id',
        value: relationValue(true, [OTHER_MEMBER_ID]),
      },
    });
  });

  it('ignores the raw value that filters loaded from a view carry as display value', () => {
    const value = relationValue(false, [OTHER_MEMBER_ID]);

    const { toggleAction } = computeMineRecordFilterToggle({
      currentRecordFilters: [buildRecordFilter({ value, displayValue: value })],
      mineFilterFieldMetadataItem: relationField,
      newRecordFilterId: 'new-filter-id',
    });

    expect(toggleAction).toMatchObject({
      type: 'upsert',
      recordFilter: { displayValue: 'Me' },
    });
  });

  it.each([
    [
      'a filter inside a filter group',
      { recordFilterGroupId: 'filter-group-id' },
    ],
    ['a filter with another operand', { operand: ViewFilterOperand.IS_NOT }],
    ['a filter on another field', { fieldMetadataId: 'other-field-id' }],
  ])('does not merge into %s', (_description, overrides) => {
    const { toggleAction } = computeMineRecordFilterToggle({
      currentRecordFilters: [
        buildRecordFilter({
          value: relationValue(false, [OTHER_MEMBER_ID]),
          ...overrides,
        }),
      ],
      mineFilterFieldMetadataItem: relationField,
      newRecordFilterId: 'new-filter-id',
    });

    expect(toggleAction).toMatchObject({
      type: 'upsert',
      recordFilter: { id: 'new-filter-id' },
    });
  });
});
