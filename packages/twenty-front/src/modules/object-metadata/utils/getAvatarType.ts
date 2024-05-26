import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getAvatarType = (objectNameSingular: string) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return 'rounded';
  }

  if (objectNameSingular === CoreObjectNameSingular.Company) {
    return 'squared';
  }

  return 'rounded';
};
