import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { buildFormulaFieldTreeUpdates } from 'src/database/commands/upgrade-version-command/2-64/utils/build-formula-field-tree-updates.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
  FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
  FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';

const buildTextFormulaField = ({
  id,
  name,
  expression,
}: {
  id: string;
  name: string;
  expression: string;
}) => {
  // The shape formulas were stored with before trees
  const settings = {
    formula: { expression, bindings: { price: 'gadget-price-uid' } },
  };

  return getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-uid`,
    name,
    type: FieldMetadataType.NUMBER,
    objectMetadataId: FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.id,
    objectMetadataUniversalIdentifier:
      FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.universalIdentifier,
    settings,
    universalSettings: settings,
  });
};

describe('buildFormulaFieldTreeUpdates', () => {
  it('should store a text formula as a tree, and leave one that does not compile as text', () => {
    const doublePrice = buildTextFormulaField({
      id: 'gadget-double-price',
      name: 'doublePrice',
      expression: 'price * 2',
    });
    const broken = buildTextFormulaField({
      id: 'gadget-old-broken',
      name: 'oldBroken',
      expression: 'deletedField * 2',
    });

    const { flatFieldMetadatasToUpdate, textFormulaFieldNames } =
      buildFormulaFieldTreeUpdates({
        flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
          flatEntities: [
            FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
            {
              ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
              fieldIds: [
                ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.fieldIds,
                doublePrice.id,
                broken.id,
              ],
              fieldUniversalIdentifiers: [
                ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.fieldUniversalIdentifiers,
                doublePrice.universalIdentifier,
                broken.universalIdentifier,
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
            doublePrice,
            broken,
          ],
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
      });

    const expectedSettings = {
      formula: {
        tree: {
          type: 'ARITHMETIC',
          operator: 'MULTIPLY',
          left: { type: 'FIELD', fieldUniversalIdentifier: 'gadget-price-uid' },
          right: { type: 'LITERAL', value: 2 },
        },
      },
    };

    expect(flatFieldMetadatasToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: doublePrice.universalIdentifier,
        settings: expectedSettings,
        universalSettings: expectedSettings,
      }),
    ]);
    expect(textFormulaFieldNames).toEqual(['broken', 'oldBroken']);
  });

  it('should leave formulas already stored as trees alone', () => {
    expect(
      buildFormulaFieldTreeUpdates({
        flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }),
    ).toEqual({
      flatFieldMetadatasToUpdate: [],
      textFormulaFieldNames: ['broken'],
    });
  });
});
