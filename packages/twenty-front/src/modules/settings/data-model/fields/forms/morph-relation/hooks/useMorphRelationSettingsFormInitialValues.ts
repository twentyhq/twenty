import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetMorphRelationMetadata } from '@/object-metadata/hooks/useGetMorphRelationMetadata';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const useMorphRelationSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
}) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const getMorphRelationMetadata = useGetMorphRelationMetadata();
  const morphRelations = fieldMetadataItem
    ? getMorphRelationMetadata({ fieldMetadataItem })
    : null;
  const initialRelationObjectMetadataItems = useMemo(() => {
    const availableItems = activeObjectMetadataItems
      .filter(isObjectMetadataAvailableForRelation)
      .sort((a, b) => a.labelSingular.localeCompare(b.labelSingular));
    const firstInitialObjectCandidate =
      morphRelations?.[0]?.relationObjectMetadataItem ?? availableItems[0];
    if (!isDefined(firstInitialObjectCandidate)) {
      throw new Error(
        'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
      );
    }
    const secondInitialObjectCandidate =
      morphRelations?.[1]?.relationObjectMetadataItem ?? availableItems[1];
    if (!isDefined(secondInitialObjectCandidate)) {
      throw new Error(
        'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
      );
    }

    return [firstInitialObjectCandidate, secondInitialObjectCandidate];
  }, [activeObjectMetadataItems, morphRelations]);

  if (isDefined(morphRelations) && morphRelations.length > 0) {
    return {
      disableFieldEdition: true,
      disableRelationEdition: true,
      initialRelationObjectMetadataItems: morphRelations.map(
        (morphRelation) => morphRelation.relationObjectMetadataItem,
      ),
      initialRelationType: morphRelations[0].relationType,
    };
  }

  return {
    disableFieldEdition: false,
    disableRelationEdition: false,
    initialRelationObjectMetadataItems,
    initialRelationType: RelationType.ONE_TO_MANY,
  };
};
