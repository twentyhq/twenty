import { buildStoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-watch-plans.util';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';

describe('buildStoredFormulaWatchPlans', () => {
  it('should watch the join column and the fields the stored formulas read on the related records', () => {
    expect(
      buildStoredFormulaWatchPlans({
        flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }),
    ).toEqual({
      relatedRecordWatchPlansByObjectMetadataId: {
        'gadget-object': [
          {
            objectMetadataId: 'supplier-object',
            joinColumnName: 'supplierId',
            watchedFieldNames: new Set(['supplierId', 'price', 'quantity']),
          },
        ],
      },
      lookedUpRecordWatchPlansByObjectMetadataId: {},
      watchedOwnFieldNamesByObjectMetadataId: { 'supplier-object': new Set() },
    });
  });

  it('should watch the looked-up record and the join column of a stored formula reading a lookup', () => {
    const storedLookupFlatFieldMetadata = {
      ...FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK.byUniversalIdentifier[
        'gadget-supplier-label-uid'
      ]!,
      universalIdentifier: 'gadget-stored-label-uid',
      settings: {
        formula: {
          expression: 'supplier.name',
          evaluation: 'STORED' as const,
          bindings: {
            supplier: 'gadget-supplier-uid',
            'supplier.name': 'supplier-name-uid',
          },
        },
      },
    };

    const {
      lookedUpRecordWatchPlansByObjectMetadataId,
      watchedOwnFieldNamesByObjectMetadataId,
    } = buildStoredFormulaWatchPlans({
      flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
      flatFieldMetadataMaps: {
        ...FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
        byUniversalIdentifier: {
          ...FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK.byUniversalIdentifier,
          'gadget-stored-label-uid': storedLookupFlatFieldMetadata,
        },
      },
    });

    expect(lookedUpRecordWatchPlansByObjectMetadataId).toEqual({
      'supplier-object': [
        {
          objectMetadataId: 'gadget-object',
          joinColumnName: 'supplierId',
          watchedFieldNames: new Set(['name']),
        },
      ],
    });
    expect(watchedOwnFieldNamesByObjectMetadataId['gadget-object']).toEqual(
      new Set(['supplier', 'supplierId']),
    );
  });
});
