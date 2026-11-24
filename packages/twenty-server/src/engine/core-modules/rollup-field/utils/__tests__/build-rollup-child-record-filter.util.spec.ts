import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { buildRollupChildRecordFilter } from 'src/engine/core-modules/rollup-field/utils/build-rollup-child-record-filter.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'is-done-id',
    universalIdentifier: 'is-done-id',
    objectMetadataId: 'task-id',
    name: 'isDone',
    type: FieldMetadataType.BOOLEAN,
  }),
  getFlatFieldMetadataMock({
    id: 'estimate-id',
    universalIdentifier: 'estimate-id',
    objectMetadataId: 'task-id',
    name: 'estimate',
    type: FieldMetadataType.NUMBER,
  }),
  getFlatFieldMetadataMock({
    id: 'subtask-count-id',
    universalIdentifier: 'subtask-count-id',
    objectMetadataId: 'task-id',
    name: 'subtaskCount',
    type: FieldMetadataType.ROLLUP,
    settings: {
      relationFieldMetadataId: 'subtasks-id',
      aggregateOperation: AggregateOperations.COUNT,
      aggregatedFieldMetadataId: null,
      filters: [],
      filterGroups: [],
      resultType: FieldMetadataType.NUMBER,
    },
  }),
].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

describe('buildRollupChildRecordFilter', () => {
  const mapsArgs = {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  };

  it('should match every related record without filters', () => {
    expect(
      buildRollupChildRecordFilter({
        settings: { filters: [], filterGroups: [] },
        ...mapsArgs,
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
        ...mapsArgs,
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
        ...mapsArgs,
      }),
    ).toEqual({
      or: [{ isDone: { eq: true } }, { estimate: { gte: 5 } }],
    });
  });

  it('should filter on a rollup field as its result type', () => {
    expect(
      buildRollupChildRecordFilter({
        settings: {
          filters: [
            {
              id: 'filter-1',
              fieldMetadataId: 'subtask-count-id',
              operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
              value: '2',
            },
          ],
          filterGroups: [],
        },
        ...mapsArgs,
      }),
    ).toEqual({ subtaskCount: { gte: 2 } });
  });
});
