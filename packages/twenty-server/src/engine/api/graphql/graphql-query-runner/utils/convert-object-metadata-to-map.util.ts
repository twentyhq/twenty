import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const convertObjectMetadataToMap = (
  objectMetadataCollection: ObjectMetadataInterface[],
): Record<string, any> => {
  const objectMetadataMap = {};

  for (const objectMetadata of objectMetadataCollection) {
    const fieldsMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      fieldsMap[fieldMetadata.name] = fieldMetadata;
    }

    const processedObjectMetadata = {
      ...objectMetadata,
      fields: fieldsMap,
    };

    objectMetadataMap[objectMetadata.id] = processedObjectMetadata;
    objectMetadataMap[objectMetadata.nameSingular] = processedObjectMetadata;
    objectMetadataMap[objectMetadata.namePlural] = processedObjectMetadata;
  }

  return objectMetadataMap;
};
