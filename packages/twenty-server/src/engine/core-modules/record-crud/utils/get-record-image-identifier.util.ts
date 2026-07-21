import { isNonEmptyString } from '@sniptt/guards';
import { getLinkFaviconUrl, isDefined } from 'twenty-shared/utils';

import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getEffectiveImageIdentifierFieldMetadataId } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-image-identifier-field-metadata-id.util';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';

type GetRecordImageIdentifierOptions = {
  record: Record<string, unknown>;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  allowRequestsToTwentyIcons: boolean;
  signUrl?: (
    fileId: string,
    fileFolder: FileFolder,
  ) => Promise<string | null> | string | null;
};

export const getRecordImageIdentifier = async ({
  record,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  allowRequestsToTwentyIcons,
  signUrl,
}: GetRecordImageIdentifierOptions): Promise<string | null> => {
  if (
    signUrl &&
    flatObjectMetadata.nameSingular === 'workspaceMember' &&
    isNonEmptyString(record.avatarUrl)
  ) {
    const avatarFileId = extractFileIdFromUrl(
      record.avatarUrl,
      FileFolder.CorePicture,
    );
    if (!isDefined(avatarFileId)) {
      return null;
    }
    return signUrl(avatarFileId, FileFolder.CorePicture);
  }

  const imageIdentifierFieldMetadataId =
    getEffectiveImageIdentifierFieldMetadataId(flatObjectMetadata);

  if (!isDefined(imageIdentifierFieldMetadataId)) {
    return null;
  }

  const imageIdentifierField = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: imageIdentifierFieldMetadataId,
  });

  if (!isDefined(imageIdentifierField)) {
    return null;
  }

  const imageValue = record[imageIdentifierField.name];

  if (!isDefined(imageValue)) {
    return null;
  }

  switch (imageIdentifierField.type) {
    case FieldMetadataType.FILES: {
      const fileId = Array.isArray(imageValue)
        ? imageValue[0]?.fileId
        : undefined;

      if (!isNonEmptyString(fileId) || !isDefined(signUrl)) {
        return null;
      }

      return signUrl(fileId, FileFolder.FilesField);
    }
    case FieldMetadataType.LINKS: {
      if (!allowRequestsToTwentyIcons) {
        return null;
      }

      const primaryLinkUrl =
        typeof imageValue === 'object' && 'primaryLinkUrl' in imageValue
          ? imageValue.primaryLinkUrl
          : undefined;

      return isNonEmptyString(primaryLinkUrl)
        ? getLinkFaviconUrl(primaryLinkUrl) || null
        : null;
    }
    default: {
      return null;
    }
  }
};
