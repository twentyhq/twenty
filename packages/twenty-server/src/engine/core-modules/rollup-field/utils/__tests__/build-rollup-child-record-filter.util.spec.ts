import {
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { buildRollupChildRecordFilter } from 'src/engine/core-modules/rollup-field/utils/build-rollup-child-record-filter.util';

describe('buildRollupChildRecordFilter', () => {
  const filterFlatFieldMetadatas = [
    {
      id: 'is-done-id',
      name: 'isDone',
      label: 'Is done',
      type: FieldMetadataType.BOOLEAN,
      settings: null,
    },
    {
      id: 'estimate-id',
      name: 'estimate',
      label: 'Estimate',
      type: FieldMetadataType.NUMBER,
      settings: null,
    },
  ];

  it('should match every related record without filters', () => {
    expect(
      buildRollupChildRecordFilter({
        settings: { filters: [], filterGroups: [] },
        filterFlatFieldMetadatas,
      }),
    ).toEqual({});
  });

  it('should combine the filters of a rollup', () => {
    expect(
      buildRollupChildRecordFilter({
        settings: {
          filters: [
            {
              id: 'filter-1',
              fieldMetadataId: 'is-done-id',
              operand: ViewFilterOperand.IS,
              value: 'true',
            },
            {
              id: 'filter-2',
              fieldMetadataId: 'estimate-id',
              operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
              value: '5',
            },
          ],
          filterGroups: [],
        },
        filterFlatFieldMetadatas,
      }),
    ).toEqual({
      and: [{ isDone: { eq: true } }, { estimate: { gte: 5 } }],
    });
  });

  it('should keep the logical operator of a filter group', () => {
    expect(
      buildRollupChildRecordFilter({
        settings: {
          filters: [
            {
              id: 'filter-1',
              fieldMetadataId: 'is-done-id',
              operand: ViewFilterOperand.IS,
              value: 'true',
              filterGroupId: 'group-1',
            },
            {
              id: 'filter-2',
              fieldMetadataId: 'estimate-id',
              operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
              value: '5',
              filterGroupId: 'group-1',
            },
          ],
          filterGroups: [
            {
              id: 'group-1',
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
          ],
        },
        filterFlatFieldMetadatas,
      }),
    ).toEqual({
      or: [{ isDone: { eq: true } }, { estimate: { gte: 5 } }],
    });
  });
});
