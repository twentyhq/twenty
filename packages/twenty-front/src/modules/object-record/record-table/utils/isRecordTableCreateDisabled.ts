import { CoreObjectNameSingular } from 'twenty-shared/types';

const OBJECTS_WITHOUT_MANUAL_RECORD_CREATION: readonly CoreObjectNameSingular[] =
  [CoreObjectNameSingular.WorkflowRun, CoreObjectNameSingular.WorkflowVersion];

export const isRecordTableCreateDisabled = (
  objectNameSingular: string,
): boolean => {
  const isDisabled = OBJECTS_WITHOUT_MANUAL_RECORD_CREATION.includes(
    objectNameSingular as CoreObjectNameSingular,
  );

  return isDisabled;
};
