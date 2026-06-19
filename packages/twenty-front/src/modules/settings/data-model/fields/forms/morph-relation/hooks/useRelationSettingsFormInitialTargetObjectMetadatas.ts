import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations';
import { isDefined } from 'twenty-shared/utils';

export const useRelationSettingsFormInitialTargetObjectMetadatas = ({
  sourceObjectMetadataId,
  fieldMetadataItem,
}: {
  sourceObjectMetadataId: string;
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'type' | 'morphRelations' | 'relation'
  >;
}) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

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

  if (isDefined(fieldMetadataItem) && isDefined(fieldMetadataItem.relation)) {
    return [fieldMetadataItem.relation.targetObjectMetadata];
  }

  const availableItems = activeObjectMetadataItems
    .filter(isObjectMetadataAvailableForRelation)
    .filter((item) => item.id !== sourceObjectMetadataId)
    .sort((a, b) => {
      const aIsCustom = getIsMetadataItemCustom(a);
      const bIsCustom = getIsMetadataItemCustom(b);
      if (aIsCustom === bIsCustom) {
        return 0;
      }
      return aIsCustom ? -1 : 1;
    });

  const firstInitialObjectCandidate = availableItems[0];
  if (!isDefined(firstInitialObjectCandidate)) {
    throw new Error(
      'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
    );
  }

  return [firstInitialObjectCandidate];
};
