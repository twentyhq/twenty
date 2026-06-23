import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';

type GetCreatableActivityObjectNameSingularFromFieldParams = {
  fieldName: string;
  fieldType: FieldMetadataType;
  objectNameSingular: string;
  isRecordFieldReadOnly: boolean;
};

// Only a read-only noteTargets/taskTargets relation on a non-activity object (e.g. Person)
// gets a create-activity button; editable ones keep the standard relation editor
export const getCreatableActivityObjectNameSingularFromField = ({
  fieldName,
  fieldType,
  objectNameSingular,
  isRecordFieldReadOnly,
}: GetCreatableActivityObjectNameSingularFromFieldParams):
  | CoreObjectNameSingular.Note
  | CoreObjectNameSingular.Task
  | undefined => {
  if (!isRecordFieldReadOnly || fieldType !== FieldMetadataType.RELATION) {
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
