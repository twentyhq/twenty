import { CoreObjectNameSingular } from 'twenty-shared/types';

const OBJECTS_WITHOUT_MANUAL_RECORD_CREATION: string[] = [
  CoreObjectNameSingular.WorkflowRun,
  CoreObjectNameSingular.WorkflowVersion,
];

export const isRecordTableCreateDisabled = (
  objectNameSingular: string,
): boolean => {
  return OBJECTS_WITHOUT_MANUAL_RECORD_CREATION.includes(objectNameSingular);
};
