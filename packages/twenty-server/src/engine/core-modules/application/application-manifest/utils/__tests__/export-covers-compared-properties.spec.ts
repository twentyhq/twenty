import { FieldMetadataType } from 'twenty-shared/types';

import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { fromFlatIndexMetadataToIndexManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-index-metadata-to-index-manifest.util';
import { fromFlatObjectMetadataToObjectManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-metadata-to-object-manifest.util';
import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const FIELD_UID = '33333333-3333-4333-8333-333333333333';
const INDEX_UID = '44444444-4444-4444-8444-444444444444';

type ExportedKind = {
  metadataName: 'objectMetadata' | 'fieldMetadata' | 'index';
  emittedProperties: string[];
  renamedProperties: Record<string, string>;
  workspaceLocalProperties: string[];
  knownGaps: Record<string, string>;
};

const WORKSPACE_LOCAL_PROPERTIES = ['isActive', 'overrides'];

const EXPORTED_KINDS: ExportedKind[] = [
  {
    metadataName: 'objectMetadata',
    emittedProperties: Object.keys(
      fromFlatObjectMetadataToObjectManifest({
        flatObjectMetadata: getFlatObjectMetadataMock({
          universalIdentifier: OBJECT_UID,
          applicationUniversalIdentifier: APP_UID,
          description: 'An object',
          icon: 'IconBox',
          color: 'blue',
          imageIdentifierFieldMetadataUniversalIdentifier: FIELD_UID,
          labelIdentifierFieldMetadataUniversalIdentifier: FIELD_UID,
        }),
        fields: [],
        labelIdentifierFieldMetadataUniversalIdentifier: FIELD_UID,
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: WORKSPACE_LOCAL_PROPERTIES,
    knownGaps: {},
  },
  {
    metadataName: 'fieldMetadata',
    emittedProperties: Object.keys(
      fromFlatFieldMetadataToFieldManifest({
        flatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: FIELD_UID,
          objectMetadataId: 'object-id',
          objectMetadataUniversalIdentifier: OBJECT_UID,
          applicationUniversalIdentifier: APP_UID,
          type: FieldMetadataType.TEXT,
          description: 'A field',
          icon: 'IconAbc',
          defaultValue: "'x'",
          options: null,
          universalSettings: null,
        }),
      }),
    ),
    renamedProperties: {},
    workspaceLocalProperties: WORKSPACE_LOCAL_PROPERTIES,
    knownGaps: {},
  },
  {
    metadataName: 'index',
    emittedProperties: Object.keys(
      fromFlatIndexMetadataToIndexManifest({
        flatIndexMetadata: getFlatIndexMetadataMock({
          universalIdentifier: INDEX_UID,
          objectMetadataId: 'object-id',
          objectMetadataUniversalIdentifier: OBJECT_UID,
          applicationUniversalIdentifier: APP_UID,
        }),
      }),
    ),
    renamedProperties: { universalFlatIndexFieldMetadatas: 'fields' },
    workspaceLocalProperties: [],
    knownGaps: {
      name: 'the forward converter derives the index name from the object and field names, so a renamed index is a known asymmetry',
      indexWhereClause:
        'partial indexes are reported as unsupported instead of exported',
    },
  },
];

describe('export coverage of the compared properties', () => {
  it.each(EXPORTED_KINDS)(
    'should emit every compared property of $metadataName or account for it explicitly',
    ({
      metadataName,
      emittedProperties,
      renamedProperties,
      workspaceLocalProperties,
      knownGaps,
    }) => {
      const { propertiesToCompare } =
        ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[
          metadataName
        ];
      const unaccounted = (propertiesToCompare as readonly string[]).filter(
        (property) =>
          !emittedProperties.includes(
            renamedProperties[property] ?? property,
          ) &&
          !workspaceLocalProperties.includes(property) &&
          !(property in knownGaps),
      );

      expect(unaccounted).toEqual([]);
    },
  );

  it.each(EXPORTED_KINDS)(
    'should not keep accounting for a property of $metadataName that is now emitted',
    ({ emittedProperties, workspaceLocalProperties, knownGaps }) => {
      const staleEntries = [
        ...workspaceLocalProperties,
        ...Object.keys(knownGaps),
      ].filter((property) => emittedProperties.includes(property));

      expect(staleEntries).toEqual([]);
    },
  );
});
