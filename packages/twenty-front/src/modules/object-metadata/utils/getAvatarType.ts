import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getAvatarType = (objectNameSingular: string) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return 'rounded';
  }

  if (objectNameSingular === CoreObjectNameSingular.Company) {
    return 'squared';
  }

  if (
    objectNameSingular === CoreObjectNameSingular.Task ||
    objectNameSingular === CoreObjectNameSingular.Note
  ) {
    return 'icon';
  }

  return 'rounded';
};
