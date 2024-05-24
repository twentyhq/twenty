import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { RelationMetadataType } from '~/generated-metadata/graphql';

export const useRelationSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'fromRelationMetadata' | 'toRelationMetadata' | 'type'
  >;
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
      objectMetadataItems.find(
        ({ nameSingular }) => nameSingular === CoreObjectNameSingular.Person,
      ) ??
      objectMetadataItems.filter(isObjectMetadataAvailableForRelation)[0],
    [objectMetadataItems, relationObjectMetadataItemFromFieldMetadata],
  );

  const initialRelationType =
    relationTypeFromFieldMetadata ?? RelationMetadataType.OneToMany;

  return {
    disableFieldEdition:
      relationFieldMetadataItem && !relationFieldMetadataItem.isCustom,
    disableRelationEdition: !!relationFieldMetadataItem,
    initialRelationFieldMetadataItem: relationFieldMetadataItem ?? {
      icon: initialRelationObjectMetadataItem.icon ?? 'IconUsers',
      label: '',
    },
    initialRelationObjectMetadataItem,
    initialRelationType,
  };
};
