import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getJoinObjectNameSingular = (
  objectNameSingular: CoreObjectNameSingular,
) => {
  switch (objectNameSingular) {
    case CoreObjectNameSingular.Note:
      return CoreObjectNameSingular.NoteTarget;
    case CoreObjectNameSingular.Task:
      return CoreObjectNameSingular.TaskTarget;
    case CoreObjectNameSingular.Comment:
      return CoreObjectNameSingular.CommentTarget;
    default:
      return '';
  }
};
