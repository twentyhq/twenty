import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { type SettingsDataModelFieldPreviewCardProps } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const useMorphRelationSettingsFormInitialValues = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'relation'>;
  objectMetadataItem?: SettingsDataModelFieldPreviewCardProps['objectMetadataItem'];
}) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const getRelationMetadata = useGetRelationMetadata();
  const {
    relationFieldMetadataItem,
    relationObjectMetadataItem: relationObjectMetadataItemFromFieldMetadata,
    relationType: relationTypeFromFieldMetadata,
  } = useMemo(
    () =>
      fieldMetadataItem ? getRelationMetadata({ fieldMetadataItem }) : null,
    [fieldMetadataItem, getRelationMetadata],
  ) ?? {};

  const initialRelationObjectMetadataItems = useMemo(() => {
    const availableItems = activeObjectMetadataItems.filter(
      isObjectMetadataAvailableForRelation,
    );
    const firstInitialObjectCandidate =
      relationObjectMetadataItemFromFieldMetadata ??
      objectMetadataItem ??
      availableItems[0];
    if (!isDefined(firstInitialObjectCandidate)) {
      throw new Error(
        'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
      );
    }
    const secondInitialObjectCandidate =
      relationObjectMetadataItemFromFieldMetadata ??
      objectMetadataItem ??
      availableItems[1];
    if (!isDefined(secondInitialObjectCandidate)) {
      throw new Error(
        'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
      );
    }
    return [firstInitialObjectCandidate, secondInitialObjectCandidate];
  }, [
    objectMetadataItem,
    activeObjectMetadataItems,
    relationObjectMetadataItemFromFieldMetadata,
  ]);

  const initialRelationType =
    relationTypeFromFieldMetadata ?? RelationType.ONE_TO_MANY;

  return {
    disableFieldEdition:
      relationFieldMetadataItem && !relationFieldMetadataItem.isCustom,
    disableRelationEdition: !!relationFieldMetadataItem,
    initialRelationObjectMetadataItems,
    initialRelationType,
  };
};
