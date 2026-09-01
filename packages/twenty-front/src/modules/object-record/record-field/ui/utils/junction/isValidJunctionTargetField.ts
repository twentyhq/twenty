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
  // The server validates universal flat metadata in
  // validateJunctionTargetSettings. Keep relation direction and source-group
  // exclusion aligned there when this resolved GraphQL representation changes.
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
