import { isNonEmptyString } from '@sniptt/guards';
import { getLogoUrlFromDomainName, isDefined } from 'twenty-shared/utils';

import { FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
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
  signUrl?: (
    fileId: string,
    fileFolder: FileFolder,
  ) => Promise<string | null> | string | null;
};

export const getRecordImageIdentifier = async ({
  record,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  signUrl,
}: GetRecordImageIdentifierOptions): Promise<string | null> => {
  // WorkspaceMember is an exception: its avatar is a TEXT field storing a signed
  // CorePicture URL, which does not fit the generic FILES/LINKS resolution.
  if (
    signUrl &&
    flatObjectMetadata.nameSingular === 'workspaceMember' &&
    isDefined(record.avatarUrl)
  ) {
    const avatarFileId = extractFileIdFromUrl(
      record.avatarUrl as string,
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
      const fileId = (imageValue as FileOutput[])?.[0]?.fileId;

      if (!isDefined(fileId) || !isDefined(signUrl)) {
        return null;
      }

      return signUrl(fileId, FileFolder.FilesField);
    }
    case FieldMetadataType.LINKS: {
      const primaryLinkUrl = (imageValue as { primaryLinkUrl?: string })
        ?.primaryLinkUrl;

      return isNonEmptyString(primaryLinkUrl)
        ? getLogoUrlFromDomainName(primaryLinkUrl) || null
        : null;
    }
    default: {
      const rawImageValue = String(imageValue);

      if (!isNonEmptyString(rawImageValue)) {
        return null;
      }

      if (signUrl && flatObjectMetadata.nameSingular === 'workspaceMember') {
        return signUrl(rawImageValue, FileFolder.FilesField);
      }

      return rawImageValue;
    }
  }
};
