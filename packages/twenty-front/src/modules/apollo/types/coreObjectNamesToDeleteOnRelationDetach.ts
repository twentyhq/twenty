import { CoreObjectNameSingular } from 'twenty-shared/types';

export const CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH = [
  CoreObjectNameSingular.NoteTarget,
  CoreObjectNameSingular.TaskTarget,
  CoreObjectNameSingular.Comment,
];
