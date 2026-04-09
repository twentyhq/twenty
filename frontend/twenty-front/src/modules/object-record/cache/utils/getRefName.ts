import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';

export const getRefName = (objectNameSingular: string, id: string) => {
  const nodeTypeName = getNodeTypename(objectNameSingular);

  return `${nodeTypeName}:${id}`;
};
