import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export type FieldUniversalIdentifierTakeover = {
  fieldMetadataId: string;
  fromUniversalIdentifier: string;
  toUniversalIdentifier: string;
};

// Reverse default relation fields (target<NameSingular> on the four standard
// relation objects) are auto-provisioned by the SDK with a universal
// identifier derived from their name. Renaming an object therefore renames
// those fields AND changes their derived identifiers, so identifier-based
// matching alone would destroy/create them instead of renaming in place.
const DEFAULT_RELATION_FORWARD_FIELD_NAME_BY_STANDARD_OBJECT_UNIVERSAL_IDENTIFIER: Record<
  string,
  string
> = {
  [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: 'timelineActivities',
  [STANDARD_OBJECTS.attachment.universalIdentifier]: 'attachments',
  [STANDARD_OBJECTS.noteTarget.universalIdentifier]: 'noteTargets',
  [STANDARD_OBJECTS.taskTarget.universalIdentifier]: 'taskTargets',
};

// Detects manifest reverse default relation fields whose universal identifier
// changed only because the owning object was renamed, and pairs them with the
// installed row they logically are. The pairing is structural: both sides must
// hang off the same auto-provisioned forward field (whose identifier is
// derived from the object universal identifier and a constant name, hence
// stable across renames). The matched installed rows can then take over the
// new derived identifier so the sync converges through an in-place rename
// instead of a destroy/create that validation rejects.
export const computeDefaultRelationFieldUniversalIdentifierTakeovers = ({
  fromFlatFieldMetadataMaps,
  toUniversalFlatFieldMetadataMaps,
}: {
  fromFlatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  toUniversalFlatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FieldUniversalIdentifierTakeover[] => {
  const takeovers: FieldUniversalIdentifierTakeover[] = [];

  for (const toField of Object.values(
    toUniversalFlatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(toField)) {
      continue;
    }

    // Already matched by universal identifier: regular update flow applies.
    if (
      isDefined(
        fromFlatFieldMetadataMaps.byUniversalIdentifier[
          toField.universalIdentifier
        ],
      )
    ) {
      continue;
    }

    if (!isMorphOrRelationFieldMetadataType(toField.type)) {
      continue;
    }

    const expectedForwardFieldName =
      DEFAULT_RELATION_FORWARD_FIELD_NAME_BY_STANDARD_OBJECT_UNIVERSAL_IDENTIFIER[
        toField.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(expectedForwardFieldName)) {
      continue;
    }

    // Only auto-provisioned reverse fields are taken over: their identifier
    // must be the deterministic derivation from their own name. An
    // author-provided identifier keeps the regular destroy/create semantics.
    const derivedToUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier: toField.applicationUniversalIdentifier,
      objectUniversalIdentifier: toField.objectMetadataUniversalIdentifier,
      name: toField.name,
    });

    if (toField.universalIdentifier !== derivedToUniversalIdentifier) {
      continue;
    }

    const forwardFieldUniversalIdentifier =
      toField.relationTargetFieldMetadataUniversalIdentifier;

    if (!isDefined(forwardFieldUniversalIdentifier)) {
      continue;
    }

    const toForwardField =
      toUniversalFlatFieldMetadataMaps.byUniversalIdentifier[
        forwardFieldUniversalIdentifier
      ];
    const fromForwardField =
      fromFlatFieldMetadataMaps.byUniversalIdentifier[
        forwardFieldUniversalIdentifier
      ];

    // The forward field exists on both sides under the same identifier, which
    // is derived from the object universal identifier: this proves the object
    // itself kept its identity and only its name changed.
    if (!isDefined(toForwardField) || !isDefined(fromForwardField)) {
      continue;
    }

    if (
      toForwardField.name !== expectedForwardFieldName ||
      fromForwardField.name !== expectedForwardFieldName
    ) {
      continue;
    }

    const derivedForwardUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier:
        toForwardField.applicationUniversalIdentifier,
      objectUniversalIdentifier:
        toForwardField.objectMetadataUniversalIdentifier,
      name: toForwardField.name,
    });

    if (forwardFieldUniversalIdentifier !== derivedForwardUniversalIdentifier) {
      continue;
    }

    // The installed counterpart is whichever field the installed forward
    // field still points back to, whatever identifier it currently carries.
    const fromReverseFieldUniversalIdentifier =
      fromForwardField.relationTargetFieldMetadataUniversalIdentifier;

    if (!isDefined(fromReverseFieldUniversalIdentifier)) {
      continue;
    }

    const fromReverseField =
      fromFlatFieldMetadataMaps.byUniversalIdentifier[
        fromReverseFieldUniversalIdentifier
      ];

    if (!isDefined(fromReverseField)) {
      continue;
    }

    // Still declared by the manifest under its current identifier: not a
    // rename of that field.
    if (
      isDefined(
        toUniversalFlatFieldMetadataMaps.byUniversalIdentifier[
          fromReverseFieldUniversalIdentifier
        ],
      )
    ) {
      continue;
    }

    if (
      fromReverseField.type !== toField.type ||
      fromReverseField.objectMetadataUniversalIdentifier !==
        toField.objectMetadataUniversalIdentifier ||
      fromReverseField.relationTargetFieldMetadataUniversalIdentifier !==
        forwardFieldUniversalIdentifier
    ) {
      continue;
    }

    takeovers.push({
      fieldMetadataId: fromReverseField.id,
      fromUniversalIdentifier: fromReverseFieldUniversalIdentifier,
      toUniversalIdentifier: toField.universalIdentifier,
    });
  }

  return takeovers;
};
