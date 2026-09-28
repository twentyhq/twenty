import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';
import {
  computeTwentyStandardApplicationAllFlatEntityMaps,
  type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

export const LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER =
  'bf830886-b6dc-46e9-a229-eecbb0e66032';
export const LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER =
  'c97a4c97-266b-490a-a4d6-76274f5de429';

// The 2.42 copy writes the old scalar, and the 2.43 expand step adds the
// member relation before its backfill. Neither may use the contracted shape.
export const computeLegacyChatOwnerStandardMetadata = (
  args: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs,
) => {
  const result = computeTwentyStandardApplicationAllFlatEntityMaps(args);
  const maps = result.allFlatEntityMaps;
  const thread = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: maps.flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  });
  const idField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: maps.flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThread.fields.id.universalIdentifier,
  });
  const member = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: maps.flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThread.fields.workspaceMember
        .universalIdentifier,
  });
  const memberIndex = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: maps.flatIndexMaps,
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThread.indexes.workspaceMemberIndex
        .universalIdentifier,
  });
  const legacyField: FlatFieldMetadata = {
    ...idField,
    id: v4(),
    universalIdentifier: LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
    name: 'userWorkspaceId',
    label: 'User Workspace ID',
    description: 'User Workspace ID',
    defaultValue: null,
    isUnique: false,
  };
  maps.flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntityMaps: maps.flatFieldMetadataMaps,
    flatEntity: legacyField,
  });
  maps.flatFieldMetadataMaps.byUniversalIdentifier[member.universalIdentifier] =
    { ...member, isNullable: true };
  const indexId = v4();
  const indexFields = [
    {
      order: 0,
      fieldMetadataUniversalIdentifier: legacyField.universalIdentifier,
      subFieldName: null,
    },
  ];
  const legacyIndex: FlatIndexMetadata = {
    ...memberIndex,
    id: indexId,
    universalIdentifier: LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER,
    name: computeFlatIndexNameOrThrow({
      flatObjectMetadata: thread,
      objectFlatFieldMetadatas: [legacyField],
      indexFields,
      isUnique: false,
      indexWhereClause: null,
    }),
    flatIndexFieldMetadatas: [
      {
        ...memberIndex.flatIndexFieldMetadatas[0],
        id: v4(),
        indexMetadataId: indexId,
        fieldMetadataId: legacyField.id,
      },
    ],
    universalFlatIndexFieldMetadatas: [
      {
        ...memberIndex.universalFlatIndexFieldMetadatas[0],
        fieldMetadataUniversalIdentifier: legacyField.universalIdentifier,
        indexMetadataUniversalIdentifier:
          LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER,
      },
    ],
  };
  maps.flatIndexMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntityMaps: maps.flatIndexMaps,
    flatEntity: legacyIndex,
  });
  result.idByUniversalIdentifierByMetadataName.fieldMetadata![
    legacyField.universalIdentifier
  ] = legacyField.id;
  result.idByUniversalIdentifierByMetadataName.index![
    legacyIndex.universalIdentifier
  ] = legacyIndex.id;
  return result;
};
