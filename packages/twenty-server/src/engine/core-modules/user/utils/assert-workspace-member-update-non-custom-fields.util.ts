import { msg } from '@lingui/core/macro';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const getRelationJoinColumnName = (
  flatFieldMetadata: FlatFieldMetadata,
): string | undefined => {
  const relationJoinColumnNameFromSettings =
    flatFieldMetadata.settings && 'joinColumnName' in flatFieldMetadata.settings
      ? flatFieldMetadata.settings.joinColumnName
      : undefined;
  const relationJoinColumnNameFromUniversalSettings =
    flatFieldMetadata.universalSettings &&
    'joinColumnName' in flatFieldMetadata.universalSettings
      ? flatFieldMetadata.universalSettings.joinColumnName
      : undefined;

  const joinColumnName =
    relationJoinColumnNameFromSettings ??
    relationJoinColumnNameFromUniversalSettings;

  return joinColumnName === null ? undefined : joinColumnName;
};

const findWorkspaceMemberFieldMetadataForPayloadKey = ({
  workspaceMemberFieldMetadatas,
  payloadKey,
}: {
  workspaceMemberFieldMetadatas: FlatFieldMetadata[];
  payloadKey: string;
}): FlatFieldMetadata | undefined =>
  workspaceMemberFieldMetadatas.find((flatFieldMetadata) => {
    if (flatFieldMetadata.name === payloadKey) {
      return true;
    }

    const relationJoinColumnName = getRelationJoinColumnName(flatFieldMetadata);

    if (!isDefined(relationJoinColumnName)) {
      return false;
    }

    return relationJoinColumnName === payloadKey;
  });

export const assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly = async ({
  workspaceId,
  update,
  workspaceManyOrAllFlatEntityMapsCacheService,
}: {
  workspaceId: string;
  update: Record<string, unknown>;
  workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
}): Promise<void> => {
  const updateKeys = Object.keys(update);

  if (updateKeys.length === 0) {
    throw new UserInputError('Update payload cannot be empty', {
      userFriendlyMessage: msg`Add at least one field to update.`,
    });
  }

  const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
    await workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      },
    );

  const workspaceMemberObjectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.workspaceMember.universalIdentifier
    ];

  if (!isDefined(workspaceMemberObjectMetadata)) {
    throw new UserInputError('workspaceMember object metadata not found', {
      userFriendlyMessage: msg`Could not load workspace member settings. Please try again.`,
    });
  }

  const workspaceMemberFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(
    (flatFieldMetadata): flatFieldMetadata is FlatFieldMetadata =>
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.objectMetadataId === workspaceMemberObjectMetadata.id,
  );

  for (const payloadKey of updateKeys) {
    const flatFieldMetadata = findWorkspaceMemberFieldMetadataForPayloadKey({
      workspaceMemberFieldMetadatas,
      payloadKey,
    });

    if (!isDefined(flatFieldMetadata)) {
      throw new UserInputError(
        `Unknown workspaceMember field in update: ${payloadKey}`,
        {
          userFriendlyMessage: msg`"${payloadKey}" is not a valid workspace member field.`,
        },
      );
    }

    if (flatFieldMetadata.isCustom === true) {
      throw new UserInputError(
        `Cannot update custom workspaceMember field via this endpoint: ${payloadKey}`,
        {
          userFriendlyMessage: msg`"${payloadKey}" is a custom field and cannot be updated here.`,
        },
      );
    }
  }
};
