import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { computeDefaultRelationFieldUniversalIdentifierTakeovers } from 'src/engine/core-modules/application/application-manifest/utils/compute-default-relation-field-universal-identifier-takeovers.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = '3f5b7b8e-8a6a-4b3e-9c1d-2e4f6a8b0c1d';
const OBJECT_UNIVERSAL_IDENTIFIER = '7d9e1f2a-3b4c-4d5e-8f6a-1b2c3d4e5f6a';
const ATTACHMENT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.attachment.universalIdentifier;
const REVERSE_FIELD_METADATA_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

const deriveFieldUniversalIdentifier = ({
  objectUniversalIdentifier,
  name,
}: {
  objectUniversalIdentifier: string;
  name: string;
}) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
    name,
  });

const FORWARD_FIELD_UNIVERSAL_IDENTIFIER = deriveFieldUniversalIdentifier({
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'attachments',
});
const OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER = deriveFieldUniversalIdentifier({
  objectUniversalIdentifier: ATTACHMENT_UNIVERSAL_IDENTIFIER,
  name: 'targetInitiative',
});
const NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER = deriveFieldUniversalIdentifier({
  objectUniversalIdentifier: ATTACHMENT_UNIVERSAL_IDENTIFIER,
  name: 'targetProject',
});

const buildForwardField = ({
  reverseFieldUniversalIdentifier,
}: {
  reverseFieldUniversalIdentifier: string;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier: FORWARD_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: 'unused',
    type: FieldMetadataType.RELATION,
    name: 'attachments',
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    relationTargetFieldMetadataUniversalIdentifier:
      reverseFieldUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      ATTACHMENT_UNIVERSAL_IDENTIFIER,
  });

const buildReverseField = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}) =>
  getFlatFieldMetadataMock({
    id: REVERSE_FIELD_METADATA_ID,
    universalIdentifier,
    objectMetadataId: 'unused',
    type: FieldMetadataType.MORPH_RELATION,
    name,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: ATTACHMENT_UNIVERSAL_IDENTIFIER,
    relationTargetFieldMetadataUniversalIdentifier:
      FORWARD_FIELD_UNIVERSAL_IDENTIFIER,
    relationTargetObjectMetadataUniversalIdentifier:
      OBJECT_UNIVERSAL_IDENTIFIER,
  });

const buildFromMaps = (
  fields: FlatFieldMetadata[],
): AllFlatEntityMaps['flatFieldMetadataMaps'] => ({
  byUniversalIdentifier: Object.fromEntries(
    fields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    fields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildToMaps = (
  fields: FlatFieldMetadata[],
): MetadataUniversalFlatEntityMaps<'fieldMetadata'> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.universalIdentifier, field]),
    ),
  }) as unknown as MetadataUniversalFlatEntityMaps<'fieldMetadata'>;

describe('computeDefaultRelationFieldUniversalIdentifierTakeovers', () => {
  it('should pair the installed reverse field with the renamed manifest reverse field', () => {
    const takeovers = computeDefaultRelationFieldUniversalIdentifierTakeovers({
      fromFlatFieldMetadataMaps: buildFromMaps([
        buildForwardField({
          reverseFieldUniversalIdentifier:
            OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        }),
        buildReverseField({
          universalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          name: 'targetInitiative',
        }),
      ]),
      toUniversalFlatFieldMetadataMaps: buildToMaps([
        buildForwardField({
          reverseFieldUniversalIdentifier:
            NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        }),
        buildReverseField({
          universalIdentifier: NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          name: 'targetProject',
        }),
      ]),
    });

    expect(takeovers).toEqual([
      {
        fieldMetadataId: REVERSE_FIELD_METADATA_ID,
        fromUniversalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        toUniversalIdentifier: NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
      },
    ]);
  });

  it('should return nothing when identifiers already match', () => {
    const fields = [
      buildForwardField({
        reverseFieldUniversalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
      }),
      buildReverseField({
        universalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        name: 'targetInitiative',
      }),
    ];

    expect(
      computeDefaultRelationFieldUniversalIdentifierTakeovers({
        fromFlatFieldMetadataMaps: buildFromMaps(fields),
        toUniversalFlatFieldMetadataMaps: buildToMaps(fields),
      }),
    ).toEqual([]);
  });

  it('should skip reverse fields with an author-provided universal identifier', () => {
    const authorProvidedUniversalIdentifier =
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

    expect(
      computeDefaultRelationFieldUniversalIdentifierTakeovers({
        fromFlatFieldMetadataMaps: buildFromMaps([
          buildForwardField({
            reverseFieldUniversalIdentifier:
              OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          }),
          buildReverseField({
            universalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
            name: 'targetInitiative',
          }),
        ]),
        toUniversalFlatFieldMetadataMaps: buildToMaps([
          buildForwardField({
            reverseFieldUniversalIdentifier: authorProvidedUniversalIdentifier,
          }),
          buildReverseField({
            universalIdentifier: authorProvidedUniversalIdentifier,
            name: 'targetProject',
          }),
        ]),
      }),
    ).toEqual([]);
  });

  it('should skip when the manifest still declares the installed reverse field', () => {
    expect(
      computeDefaultRelationFieldUniversalIdentifierTakeovers({
        fromFlatFieldMetadataMaps: buildFromMaps([
          buildForwardField({
            reverseFieldUniversalIdentifier:
              OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          }),
          buildReverseField({
            universalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
            name: 'targetInitiative',
          }),
        ]),
        toUniversalFlatFieldMetadataMaps: buildToMaps([
          buildForwardField({
            reverseFieldUniversalIdentifier:
              NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          }),
          buildReverseField({
            universalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
            name: 'targetInitiative',
          }),
          buildReverseField({
            universalIdentifier: NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
            name: 'targetProject',
          }),
        ]),
      }),
    ).toEqual([]);
  });

  it('should skip relation fields that do not target a default relation standard object', () => {
    const otherObjectUniversalIdentifier =
      '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    const forwardUniversalIdentifier = deriveFieldUniversalIdentifier({
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      name: 'children',
    });
    const buildCustomReverseField = (name: string) =>
      getFlatFieldMetadataMock({
        id: REVERSE_FIELD_METADATA_ID,
        universalIdentifier: deriveFieldUniversalIdentifier({
          objectUniversalIdentifier: otherObjectUniversalIdentifier,
          name,
        }),
        objectMetadataId: 'unused',
        type: FieldMetadataType.RELATION,
        name,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        objectMetadataUniversalIdentifier: otherObjectUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier:
          forwardUniversalIdentifier,
        relationTargetObjectMetadataUniversalIdentifier:
          OBJECT_UNIVERSAL_IDENTIFIER,
      });
    const buildCustomForwardField = (reverseUniversalIdentifier: string) =>
      getFlatFieldMetadataMock({
        universalIdentifier: forwardUniversalIdentifier,
        objectMetadataId: 'unused',
        type: FieldMetadataType.RELATION,
        name: 'children',
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          reverseUniversalIdentifier,
        relationTargetObjectMetadataUniversalIdentifier:
          otherObjectUniversalIdentifier,
      });

    expect(
      computeDefaultRelationFieldUniversalIdentifierTakeovers({
        fromFlatFieldMetadataMaps: buildFromMaps([
          buildCustomForwardField(
            buildCustomReverseField('parentInitiative').universalIdentifier,
          ),
          buildCustomReverseField('parentInitiative'),
        ]),
        toUniversalFlatFieldMetadataMaps: buildToMaps([
          buildCustomForwardField(
            buildCustomReverseField('parentProject').universalIdentifier,
          ),
          buildCustomReverseField('parentProject'),
        ]),
      }),
    ).toEqual([]);
  });

  it('should pair structurally when the installed identifier no longer matches its own name derivation', () => {
    // State left by a takeover whose follow-up migration did not complete:
    // the row still carries the old name but already holds the identifier
    // derived from the new one. Reverting the manifest must converge back.
    const takeovers = computeDefaultRelationFieldUniversalIdentifierTakeovers({
      fromFlatFieldMetadataMaps: buildFromMaps([
        buildForwardField({
          reverseFieldUniversalIdentifier:
            NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        }),
        buildReverseField({
          universalIdentifier: NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          name: 'targetInitiative',
        }),
      ]),
      toUniversalFlatFieldMetadataMaps: buildToMaps([
        buildForwardField({
          reverseFieldUniversalIdentifier:
            OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        }),
        buildReverseField({
          universalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
          name: 'targetInitiative',
        }),
      ]),
    });

    expect(takeovers).toEqual([
      {
        fieldMetadataId: REVERSE_FIELD_METADATA_ID,
        fromUniversalIdentifier: NEW_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
        toUniversalIdentifier: OLD_REVERSE_FIELD_UNIVERSAL_IDENTIFIER,
      },
    ]);
  });
});
