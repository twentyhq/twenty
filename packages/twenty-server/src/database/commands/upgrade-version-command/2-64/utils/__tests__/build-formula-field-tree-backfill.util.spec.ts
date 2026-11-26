import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildFormulaFieldTreeBackfill } from 'src/database/commands/upgrade-version-command/2-64/utils/build-formula-field-tree-backfill.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
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
  const settings = {
    formula: { expression, bindings: { cost: 'gadget-price-uid' } },
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

const backfill = (
  textFormulaFields: ReturnType<typeof buildTextFormulaField>[],
) =>
  buildFormulaFieldTreeBackfill({
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
        {
          ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
          fieldIds: [
            ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.fieldIds,
            ...textFormulaFields.map(({ id }) => id),
          ],
          fieldUniversalIdentifiers: [
            ...FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK.fieldUniversalIdentifiers,
            ...textFormulaFields.map(
              ({ universalIdentifier }) => universalIdentifier,
            ),
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
        ...textFormulaFields,
      ],
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
  });

describe('buildFormulaFieldTreeBackfill', () => {
  it('should add a tree next to the text, following bindings to renamed fields', () => {
    const doubleCost = buildTextFormulaField({
      id: 'gadget-double-cost',
      name: 'doubleCost',
      expression: 'cost * 2',
    });

    const { flatFieldMetadatasToUpdate } = backfill([doubleCost]);
    const expectedSettings = {
      formula: {
        expression: 'cost * 2',
        bindings: { cost: 'gadget-price-uid' },
        tree: {
          type: 'ARITHMETIC',
          operator: 'MULTIPLY',
          left: { type: 'FIELD', fieldUniversalIdentifier: 'gadget-price-uid' },
          right: { type: 'LITERAL', value: 2 },
        },
      },
    };

    expect(flatFieldMetadatasToUpdate).toContainEqual(
      expect.objectContaining({
        universalIdentifier: doubleCost.universalIdentifier,
        settings: expectedSettings,
        universalSettings: expectedSettings,
      }),
    );
  });

  it('should report a formula that does not parse and leave formulas that have a tree', () => {
    const unparsed = buildTextFormulaField({
      id: 'gadget-unparsed',
      name: 'unparsed',
      expression: 'cost *',
    });

    const { flatFieldMetadatasToUpdate, unparsedFormulaFieldNames } = backfill([
      unparsed,
    ]);

    expect(unparsedFormulaFieldNames).toEqual(['unparsed']);
    expect(
      flatFieldMetadatasToUpdate.map(({ name }) => name).sort(),
    ).toEqual(['broken']);
  });
});
