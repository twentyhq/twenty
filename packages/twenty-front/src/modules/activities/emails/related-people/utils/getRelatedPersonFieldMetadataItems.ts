import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type ObjectMetadataItemForRelatedPersonFields = {
  nameSingular: string;
  fields: FieldMetadataItem[];
};

// Any object that points at a person in one hop can be emailed through that
// relation, so the choices are read off the object rather than configured.
// Person itself is excluded because it has its own Send Email action.
export const getRelatedPersonFieldMetadataItems = (
  objectMetadataItem: ObjectMetadataItemForRelatedPersonFields,
): FieldMetadataItem[] => {
  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.Person) {
    return [];
  }

  return objectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive === true &&
      fieldMetadataItem.isSystem !== true &&
      fieldMetadataItem.type === FieldMetadataType.RELATION &&
      fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
      fieldMetadataItem.relation.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.Person,
  );
};
