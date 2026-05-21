import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isReverseActivityTargetField = (
  fieldName: string,
  objectNameSingular: string,
): boolean => {
  const isNoteOrTaskField =
    fieldName === 'noteTargets' || fieldName === 'taskTargets';

  const isSourceObject =
    objectNameSingular === CoreObjectNameSingular.Person ||
    objectNameSingular === CoreObjectNameSingular.Company ||
    objectNameSingular === CoreObjectNameSingular.Opportunity;

  return isNoteOrTaskField && isSourceObject;
};
