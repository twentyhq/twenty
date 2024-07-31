import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getJoinObjectNameSingular = (
  objectNameSingular: CoreObjectNameSingular,
) => {
  return objectNameSingular === CoreObjectNameSingular.Note
    ? CoreObjectNameSingular.NoteTarget
    : objectNameSingular === CoreObjectNameSingular.Task
      ? CoreObjectNameSingular.TaskTarget
      : '';
};
