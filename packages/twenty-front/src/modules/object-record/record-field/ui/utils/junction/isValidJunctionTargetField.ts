import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { getFieldRelations } from '@/object-record/record-field/ui/utils/junction/getFieldRelations';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const isValidJunctionTargetField = ({
  fieldMetadataItem,
  sourceFieldMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  sourceFieldMetadataId?: string;
}): boolean => {
  // Keep aligned with the server's validateJunctionTargetSettings.
  const relations = getFieldRelations(fieldMetadataItem);

  return (
    relations.length > 0 &&
    relations.every(({ type }) => type === RelationType.MANY_TO_ONE) &&
    (!isDefined(sourceFieldMetadataId) ||
      !doesFieldMetadataItemMatchFieldMetadataId({
        fieldMetadataItem,
        fieldMetadataId: sourceFieldMetadataId,
      }))
  );
};
