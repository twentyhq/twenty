import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { SettingsDataModelFieldPreviewCardProps } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const useRelationSettingsFormInitialValues = ({
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

  const initialRelationObjectMetadataItem = useMemo(() => {
    const availableItems = activeObjectMetadataItems.filter(
      isObjectMetadataAvailableForRelation,
    );
    const initialObjectCandidate =
      relationObjectMetadataItemFromFieldMetadata ??
      objectMetadataItem ??
      availableItems[0];
    if (!isDefined(initialObjectCandidate)) {
      throw new Error(
        'Relation Form initialization error: invariant violated – no valid object available for relation (this should never happen).',
      );
    }
    return initialObjectCandidate;
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
    initialRelationFieldMetadataItem: relationFieldMetadataItem ?? {
      icon: initialRelationObjectMetadataItem.icon ?? 'IconUsers',
      label: [RelationType.MANY_TO_ONE].includes(initialRelationType)
        ? initialRelationObjectMetadataItem.labelPlural
        : initialRelationObjectMetadataItem.labelSingular,
    },
    initialRelationObjectMetadataItem,
    initialRelationType,
  };
};
