import { isNonEmptyString } from '@sniptt/guards';
import { getLogoUrlFromDomainName, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type GetRecordImageIdentifierOptions = {
  record: Record<string, unknown>;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  signUrl?: (url: string) => string | null;
};

export const getRecordImageIdentifier = ({
  record,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  signUrl,
}: GetRecordImageIdentifierOptions): string | null => {
  if (flatObjectMetadata.nameSingular === 'company') {
    const domainNameObj = record.domainName as
      | { primaryLinkUrl?: string }
      | undefined;
    const domainNamePrimaryLinkUrl = domainNameObj?.primaryLinkUrl;

    return domainNamePrimaryLinkUrl
      ? getLogoUrlFromDomainName(domainNamePrimaryLinkUrl) || null
      : null;
  }

  if (!isDefined(flatObjectMetadata.imageIdentifierFieldMetadataId)) {
    return null;
  }

  const imageIdentifierField = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: flatObjectMetadata.imageIdentifierFieldMetadataId,
  });

  if (!isDefined(imageIdentifierField)) {
    return null;
  }

  const imageValue = record[imageIdentifierField.name];

  if (!isDefined(imageValue)) {
    return null;
  }

  const rawImageValue = String(imageValue);

  if (!isNonEmptyString(rawImageValue)) {
    return null;
  }

  if (
    signUrl &&
    (flatObjectMetadata.nameSingular === 'person' ||
      flatObjectMetadata.nameSingular === 'workspaceMember')
  ) {
    return signUrl(rawImageValue);
  }

  return rawImageValue;
};
