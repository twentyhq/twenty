import { FieldMetadataType } from 'twenty-shared/types';

import { buildStoredFormulaColumnExpressions } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-column-expressions.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
  FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';

const DOUBLED_COUNT_FLAT_FIELD_METADATA = getFlatFieldMetadataMock({
  id: 'supplier-doubled-count',
  universalIdentifier: 'supplier-doubled-count-uid',
  name: 'doubledCount',
  type: FieldMetadataType.NUMBER,
  objectMetadataId: FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK.id,
  objectMetadataUniversalIdentifier:
    FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK.universalIdentifier,
  formula: {
    tree: {
      type: 'ARITHMETIC',
      operator: 'MULTIPLY',
      left: {
        type: 'FIELD',
        fieldUniversalIdentifier: 'supplier-gadget-count-uid',
      },
      right: { type: 'LITERAL', value: 2 },
    },
    evaluation: 'STORED',
  },
});

const SUPPLIER_FLAT_OBJECT_METADATA = {
  ...FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
  fieldIds: [
    ...FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK.fieldIds,
    DOUBLED_COUNT_FLAT_FIELD_METADATA.id,
  ],
  fieldUniversalIdentifiers: [
    ...FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK.fieldUniversalIdentifiers,
    DOUBLED_COUNT_FLAT_FIELD_METADATA.universalIdentifier,
  ],
};

const buildSupplierPasses = (formulaFieldMetadataIds?: string[]) =>
  buildStoredFormulaColumnExpressions({
    flatObjectMetadata: SUPPLIER_FLAT_OBJECT_METADATA,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        SUPPLIER_FLAT_OBJECT_METADATA,
        FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
      ],
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [DOUBLED_COUNT_FLAT_FIELD_METADATA],
      flatEntityMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
    }),
    schemaName: 'workspace',
    formulaFieldMetadataIds,
  }).map(({ columnExpressions }) =>
    columnExpressions.map(({ fieldName }) => fieldName),
  );

describe('buildStoredFormulaColumnExpressions', () => {
  it('should compute a stored formula reading another one of the same record once that one is written', () => {
    expect(buildSupplierPasses()).toEqual([
      ['gadgetCount', 'stockValue'],
      ['doubledCount'],
    ]);
  });

  it('should compute only the requested formulas, in one pass when they do not read each other', () => {
    expect(buildSupplierPasses(['supplier-doubled-count'])).toEqual([
      ['doubledCount'],
    ]);
  });
});
