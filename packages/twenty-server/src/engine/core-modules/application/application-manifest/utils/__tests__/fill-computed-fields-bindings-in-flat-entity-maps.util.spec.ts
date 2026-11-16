import {
  type FieldMetadataComputation,
  FieldMetadataType,
} from 'twenty-shared/types';

import { fillComputedFieldsBindingsInFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/fill-computed-fields-bindings-in-flat-entity-maps.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const OBJECT_UID = 'project-object';

const buildField = ({
  universalIdentifier,
  name,
  computation = null,
}: {
  universalIdentifier: string;
  name: string;
  computation?: FieldMetadataComputation | null;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: 'project-object-id',
    objectMetadataUniversalIdentifier: OBJECT_UID,
    type: FieldMetadataType.NUMBER,
    name,
    computation,
  });

const fillManifestComputation = (computation: FieldMetadataComputation) => {
  const toAllUniversalFlatEntityMaps = {
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps: {
      ...createEmptyFlatEntityMaps(),
      byUniversalIdentifier: {
        'bonus-field': buildField({
          universalIdentifier: 'bonus-field',
          name: 'bonus',
        }),
        'total-field': buildField({
          universalIdentifier: 'total-field',
          name: 'total',
          computation,
        }),
      },
    },
  };

  fillComputedFieldsBindingsInFlatEntityMaps({
    existingAllFlatEntityMaps: {
      flatObjectMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [OBJECT_UID]: getFlatObjectMetadataMock({
            universalIdentifier: OBJECT_UID,
          }),
        },
      },
      flatFieldMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          'budget-field': buildField({
            universalIdentifier: 'budget-field',
            name: 'budget',
          }),
          // Renamed by the manifest: the manifest name wins
          'bonus-field': buildField({
            universalIdentifier: 'bonus-field',
            name: 'extra',
          }),
        },
      },
    },
    toAllUniversalFlatEntityMaps,
  });

  return toAllUniversalFlatEntityMaps.flatFieldMetadataMaps
    .byUniversalIdentifier['total-field'].computation;
};

describe('fillComputedFieldsBindingsInFlatEntityMaps', () => {
  it('binds a manifest computation to workspace and manifest fields, replacing the bindings it came with', () => {
    expect(
      fillManifestComputation({
        kind: 'FORMULA',
        expression: 'budget + bonus',
        bindings: { budget: 'from-the-manifest' },
      }),
    ).toEqual({
      kind: 'FORMULA',
      expression: 'budget + bonus',
      bindings: { budget: 'budget-field', bonus: 'bonus-field' },
    });
  });

  it('leaves a computation that does not resolve without bindings, for validation to report', () => {
    expect(
      fillManifestComputation({
        kind: 'FORMULA',
        expression: 'budget + extra',
        bindings: { budget: 'from-the-manifest' },
      }),
    ).toEqual({ kind: 'FORMULA', expression: 'budget + extra' });
  });
});
