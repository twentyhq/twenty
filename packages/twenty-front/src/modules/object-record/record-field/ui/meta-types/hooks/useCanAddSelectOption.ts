import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isNonEmptyString } from '@sniptt/guards';
import { useParams } from 'react-router-dom';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanAddSelectOption = (fieldName: string) => {
  const { objectNamePlural } = useParams();

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const canAddSelectOption =
    userHasPermissionToEditDataModel &&
    isNonEmptyString(fieldName) &&
    isNonEmptyString(objectNamePlural);

  return { canAddSelectOption };
};
