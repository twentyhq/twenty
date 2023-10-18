import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useFindOneMetadataObject = ({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const foundMetadataObject = metadataObjects.find(
    (object) => object.namePlural === objectNamePlural,
  );

  const objectNotFoundInMetadata =
    metadataObjects.length > 0 && !foundMetadataObject;

  return {
    foundMetadataObject,
    objectNotFoundInMetadata,
  };
};
