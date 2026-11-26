import { isDefined } from 'twenty-shared/utils';

import { buildStoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-watch-plans.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
  FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
  FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';

describe('buildStoredFormulaWatchPlans', () => {
  it('should watch the join column and the fields the stored formulas read on the related records', () => {
    expect(
      buildStoredFormulaWatchPlans({
        flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
        schemaName: 'workspace',
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
      id: 'gadget-stored-label',
      universalIdentifier: 'gadget-stored-label-uid',
      name: 'storedLabel',
      formula: { expression: 'supplier.name', evaluation: 'STORED' as const },
    };

    const {
      lookedUpRecordWatchPlansByObjectMetadataId,
      watchedOwnFieldNamesByObjectMetadataId,
    } = buildStoredFormulaWatchPlans({
      flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
        flatEntities: [
          FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
          {
            ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
            fieldIds: [
              ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.fieldIds,
              storedLookupFlatFieldMetadata.id,
            ],
          },
        ],
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
        flatEntities: [
          ...Object.values(
            FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK.byUniversalIdentifier,
          ).filter(isDefined),
          storedLookupFlatFieldMetadata,
        ],
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      schemaName: 'workspace',
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
