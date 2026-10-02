import { type NavigateAppToolOutput } from 'twenty-shared/ai';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

// The record itself is never read: the record page applies the caller's permissions when it loads
export const buildNavigateToRecordOutput = ({
  objectNameSingular,
  recordId,
  flatObjectMetadataMaps,
  objectsPermissions,
}: {
  objectNameSingular: string;
  recordId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectsPermissions: ObjectsPermissions;
}): ToolOutput<NavigateAppToolOutput> => {
  const flatObjectMetadata = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).find(
    (metadata): metadata is FlatObjectMetadata =>
      isDefined(metadata) &&
      metadata.nameSingular === objectNameSingular &&
      resolveEffectiveFlatEntityProperty({
        metadataName: 'objectMetadata',
        flatEntity: metadata,
        property: 'isActive',
      }),
  );

  if (
    !isDefined(flatObjectMetadata) ||
    !objectsPermissions[flatObjectMetadata.id]?.canReadObjectRecords
  ) {
    return {
      success: false,
      message: `Record not found in ${objectNameSingular}`,
      error: `No ${objectNameSingular} record with id "${recordId}" was found, or you do not have access to it.`,
    };
  }

  return {
    success: true,
    message: `Navigating to ${objectNameSingular} record "${recordId}"`,
    result: {
      action: 'navigateToRecord',
      objectNameSingular,
      recordId,
    },
  };
};
