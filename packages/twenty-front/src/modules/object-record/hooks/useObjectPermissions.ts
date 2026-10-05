import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useObjectPermissions = () => {
  const objectPermissionsByObjectMetadataId = useAtomStateValue(
    objectPermissionsByObjectMetadataIdSelector,
  );

  return {
    objectPermissionsByObjectMetadataId,
  };
};
