import { FieldMetadataType } from 'twenty-shared/types';

import { buildFormulaFieldTextStrips } from 'src/database/commands/upgrade-version-command/2-65/utils/build-formula-field-text-strips.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const TREE = { type: 'FIELD', fieldUniversalIdentifier: 'gadget-price-uid' };

const buildFormulaField = ({
  name,
  formula,
}: {
  name: string;
  formula: Record<string, unknown>;
}) =>
  getFlatFieldMetadataMock({
    id: name,
    universalIdentifier: `${name}-uid`,
    name,
    type: FieldMetadataType.NUMBER,
    objectMetadataId: 'gadget-object',
    objectMetadataUniversalIdentifier: 'gadget-object-uid',
    settings: { formula },
    universalSettings: { formula },
  });

describe('buildFormulaFieldTextStrips', () => {
  it('should drop the text and bindings kept next to a tree, and report a formula without tree', () => {
    const { flatFieldMetadatasToUpdate, treelessFormulaFieldNames } =
      buildFormulaFieldTextStrips({
        flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
          flatEntities: [
            buildFormulaField({
              name: 'keptFrom264',
              formula: {
                expression: 'price',
                bindings: { price: 'gadget-price-uid' },
                tree: TREE,
                evaluation: 'STORED',
              },
            }),
            buildFormulaField({
              name: 'treeOnly',
              formula: { tree: TREE },
            }),
            buildFormulaField({
              name: 'treeless',
              formula: { expression: 'price *', bindings: {} },
            }),
          ],
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
      });

    expect(flatFieldMetadatasToUpdate).toEqual([
      expect.objectContaining({
        name: 'keptFrom264',
        settings: { formula: { tree: TREE, evaluation: 'STORED' } },
        universalSettings: { formula: { tree: TREE, evaluation: 'STORED' } },
      }),
    ]);
    expect(treelessFormulaFieldNames).toEqual(['treeless']);
  });
});
