import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type FindManyToOneRelationFieldToObjectParams = {
  fields: FieldMetadataItem[];
  targetObjectMetadataId: string;
};

export const findManyToOneRelationFieldToObject = ({
  fields,
  targetObjectMetadataId,
}: FindManyToOneRelationFieldToObjectParams) =>
  fields.find(
    (field) =>
      field.isActive === true &&
      field.type === FieldMetadataType.RELATION &&
      field.relation?.type === RelationType.MANY_TO_ONE &&
      field.relation.targetObjectMetadata.id === targetObjectMetadataId,
  );
