import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useParams } from 'react-router-dom';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanAddSelectOption = (fieldName: string) => {
  const { objectNamePlural } = useParams();

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const canAddSelectOption =
    userHasPermissionToEditDataModel && !!fieldName && !!objectNamePlural;

  return { canAddSelectOption };
};
