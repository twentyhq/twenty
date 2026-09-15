import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanAddSelectOption = (fieldMetadataId: string) => {
  const { fieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemById(fieldMetadataId);

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const canAddSelectOption =
    userHasPermissionToEditDataModel &&
    isNonEmptyString(fieldMetadataItem?.name) &&
    isNonEmptyString(objectMetadataItem?.namePlural);

  return { canAddSelectOption };
};
