import { FieldMetadataType } from 'twenty-shared/types';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

describe('getAvailableAggregationsFromObjectFields', () => {
  it('should offer aggregations on a stored number field', () => {
    expect(
      Object.keys(
        getAvailableAggregationsFromObjectFields([
          { name: 'price', type: FieldMetadataType.NUMBER, settings: null },
        ]),
      ),
    ).toEqual(
      expect.arrayContaining(['sumPrice', 'avgPrice', 'countEmptyPrice']),
    );
  });

  it('should offer no aggregation on a formula field', () => {
    expect(
      Object.keys(
        getAvailableAggregationsFromObjectFields([
          {
            name: 'total',
            type: FieldMetadataType.NUMBER,
            settings: { formula: { expression: 'price * quantity' } },
          },
        ]),
      ).filter((aggregationName) => aggregationName.endsWith('Total')),
    ).toEqual([]);
  });
});
