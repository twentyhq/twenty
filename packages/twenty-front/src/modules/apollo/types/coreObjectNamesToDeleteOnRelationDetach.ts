import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH = [
  CoreObjectNameSingular.Favorite,
  CoreObjectNameSingular.NoteTarget,
  CoreObjectNameSingular.TaskTarget,
  CoreObjectNameSingular.Comment,
];
