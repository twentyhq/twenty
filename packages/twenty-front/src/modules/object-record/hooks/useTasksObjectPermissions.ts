import { useObjectPermissionsForObject } from './useObjectPermissionsForObject';

export const useTasksObjectPermissions = (objectMetadataId: string) => {
  const objectPermissions = useObjectPermissionsForObject(objectMetadataId);

  return objectPermissions.canReadObjectRecords;
};
