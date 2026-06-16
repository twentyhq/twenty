import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';

export const isNoteTargetOnNonActivityObject = (
  fieldName: string,
  objectNameSingular: string | undefined,
  fieldType: FieldMetadataType,
) => {
  return (
    fieldName === 'noteTargets' &&
    fieldType === FieldMetadataType.RELATION &&
    objectNameSingular !== CoreObjectNameSingular.Note
  );
};

export const isTaskTargetOnNonActivityObject = (
  fieldName: string,
  objectNameSingular: string | undefined,
  fieldType: FieldMetadataType,
) => {
  return (
    fieldName === 'taskTargets' &&
    fieldType === FieldMetadataType.RELATION &&
    objectNameSingular !== CoreObjectNameSingular.Task
  );
};
