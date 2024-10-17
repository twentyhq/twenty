import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { SettingsDataModelFieldPreviewCardProps } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

export const useRelationSettingsFormInitialValues = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'relationDefinition'>;
  objectMetadataItem?: SettingsDataModelFieldPreviewCardProps['objectMetadataItem'];
}) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

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

  const initialRelationObjectMetadataItem = useMemo(
    () =>
      relationObjectMetadataItemFromFieldMetadata ??
      objectMetadataItem ??
      objectMetadataItems.filter(isObjectMetadataAvailableForRelation)[0],
    [
      objectMetadataItem,
      objectMetadataItems,
      relationObjectMetadataItemFromFieldMetadata,
    ],
  );

  const initialRelationType =
    relationTypeFromFieldMetadata ?? RelationDefinitionType.OneToMany;

  return {
    disableFieldEdition:
      relationFieldMetadataItem && !relationFieldMetadataItem.isCustom,
    disableRelationEdition: !!relationFieldMetadataItem,
    initialRelationFieldMetadataItem: relationFieldMetadataItem ?? {
      icon: initialRelationObjectMetadataItem.icon ?? 'IconUsers',
      label: [
        RelationDefinitionType.ManyToMany,
        RelationDefinitionType.ManyToOne,
      ].includes(initialRelationType)
        ? initialRelationObjectMetadataItem.labelPlural
        : initialRelationObjectMetadataItem.labelSingular,
    },
    initialRelationObjectMetadataItem,
    initialRelationType,
  };
};
