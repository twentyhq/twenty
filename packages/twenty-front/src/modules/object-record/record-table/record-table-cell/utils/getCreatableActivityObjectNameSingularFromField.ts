import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';

type GetCreatableActivityObjectNameSingularFromFieldParams = {
  fieldName: string;
  fieldType: FieldMetadataType;
  objectNameSingular: string;
};

// noteTargets/taskTargets are read-only relation fields, but on a non-activity
// object (e.g. Person) their cell button creates a note/task pre-linked to the row
export const getCreatableActivityObjectNameSingularFromField = ({
  fieldName,
  fieldType,
  objectNameSingular,
}: GetCreatableActivityObjectNameSingularFromFieldParams):
  | CoreObjectNameSingular.Note
  | CoreObjectNameSingular.Task
  | undefined => {
  if (fieldType !== FieldMetadataType.RELATION) {
    return undefined;
  }

  if (
    fieldName === 'noteTargets' &&
    objectNameSingular !== CoreObjectNameSingular.Note
  ) {
    return CoreObjectNameSingular.Note;
  }

  if (
    fieldName === 'taskTargets' &&
    objectNameSingular !== CoreObjectNameSingular.Task
  ) {
    return CoreObjectNameSingular.Task;
  }

  return undefined;
};
