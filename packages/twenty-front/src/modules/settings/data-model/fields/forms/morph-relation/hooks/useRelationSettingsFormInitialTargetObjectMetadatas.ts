import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isAdvancedRelationTargetObjectMetadata } from '@/object-metadata/utils/isAdvancedRelationTargetObjectMetadata';
import { isObjectMetadataEligibleAsRelationTarget } from '@/object-metadata/utils/isObjectMetadataEligibleAsRelationTarget';
import { FieldMetadataType } from 'twenty-shared/types';
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

  // A morph field can have no destinations left; a default candidate here
  // would be shown as saved and then sent as a new destination.
  if (fieldMetadataItem?.type === FieldMetadataType.MORPH_RELATION) {
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
    .filter(isObjectMetadataEligibleAsRelationTarget)
    .filter((item) => item.id !== sourceObjectMetadataId)
    .sort((a, b) => {
      const aIsAdvanced = isAdvancedRelationTargetObjectMetadata(a);
      const bIsAdvanced = isAdvancedRelationTargetObjectMetadata(b);
      if (aIsAdvanced !== bIsAdvanced) {
        return aIsAdvanced ? 1 : -1;
      }
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
