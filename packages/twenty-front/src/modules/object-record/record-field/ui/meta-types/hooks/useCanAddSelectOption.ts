import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanAddSelectOption = ({
  fieldName,
  objectMetadataNameSingular,
}: {
  fieldName: string;
  objectMetadataNameSingular: string | undefined;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const objectNamePlural = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectMetadataNameSingular,
  )?.namePlural;

  const canAddSelectOption =
    userHasPermissionToEditDataModel &&
    isNonEmptyString(fieldName) &&
    isNonEmptyString(objectNamePlural);

  return { canAddSelectOption };
};
