import { useObjectNamePluralForSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useObjectNamePluralForSelectOption';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanAddSelectOption = ({
  fieldName,
  objectMetadataNameSingular,
}: {
  fieldName?: string;
  objectMetadataNameSingular?: string;
}) => {
  const { objectNamePlural } = useObjectNamePluralForSelectOption(
    objectMetadataNameSingular,
  );

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const canAddSelectOption =
    userHasPermissionToEditDataModel &&
    isNonEmptyString(fieldName) &&
    isNonEmptyString(objectNamePlural);

  return { canAddSelectOption };
};
