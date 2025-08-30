import { useMemo } from 'react';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type UseRelationSettingsFormInitialValuesProps = {
  existingFieldMetadataId: string;
  objectMetadataItem?: Pick<
    ObjectMetadataItem,
    'id' | 'icon' | 'labelSingular' | 'labelPlural'
  >;
};

export const useRelationSettingsFormInitialValues = ({
  existingFieldMetadataId,
  objectMetadataItem,
}: UseRelationSettingsFormInitialValuesProps) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

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
      isDefined(relationFieldMetadataItem) &&
      relationFieldMetadataItem?.isCustom === true,
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
