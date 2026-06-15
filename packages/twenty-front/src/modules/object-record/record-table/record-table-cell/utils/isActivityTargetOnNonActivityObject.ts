import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isNoteTargetOnNonActivityObject = (
  fieldName: string,
  objectNameSingular: string,
) => {
  return (
    fieldName === 'noteTargets' &&
    objectNameSingular !== CoreObjectNameSingular.Note
  );
};

export const isTaskTargetOnNonActivityObject = (
  fieldName: string,
  objectNameSingular: string,
) => {
  return (
    fieldName === 'taskTargets' &&
    objectNameSingular !== CoreObjectNameSingular.Task
  );
};
