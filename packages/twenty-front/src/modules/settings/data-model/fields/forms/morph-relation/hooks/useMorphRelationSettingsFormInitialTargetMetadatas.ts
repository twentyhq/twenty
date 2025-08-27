import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations';
import { isDefined } from 'twenty-shared/utils';

export const useMorphRelationSettingsFormInitialTargetMetadatas = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
}) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  if (
    isDefined(fieldMetadataItem) &&
    fieldMetadataItemHasMorphRelations(fieldMetadataItem)
  ) {
    return (
      fieldMetadataItem.morphRelations?.map((morphRelation) => {
        return {
          ...morphRelation.targetObjectMetadata,
          icon: activeObjectMetadataItems.find(
            (item) => item.id === morphRelation.targetObjectMetadata.id,
          )?.icon,
        };
      }) ?? []
    );
  }

  const availableItems = activeObjectMetadataItems
    .filter(isObjectMetadataAvailableForRelation)
    .sort((a, b) => a.labelSingular.localeCompare(b.labelSingular));
  const firstInitialObjectCandidate = availableItems[0];
  if (!isDefined(firstInitialObjectCandidate)) {
    throw new Error(
      'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
    );
  }
  const secondInitialObjectCandidate = availableItems[1];
  if (!isDefined(secondInitialObjectCandidate)) {
    throw new Error(
      'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
    );
  }

  return [firstInitialObjectCandidate, secondInitialObjectCandidate];
};
