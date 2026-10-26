import { type RecordPermissionCondition } from 'twenty-shared/types';
import { isDefined, isPlainObject, parseJson } from 'twenty-shared/utils';

export const isRecordPermissionConditionMemberDependent = (
  condition: RecordPermissionCondition | null,
): boolean => {
  if (!isDefined(condition)) return false;
  if (condition.kind !== 'predicate') {
    return condition.conditions.some(
      isRecordPermissionConditionMemberDependent,
    );
  }
  const value =
    typeof condition.value === 'string'
      ? parseJson<unknown>(condition.value)
      : condition.value;

  return (
    isDefined(condition.memberFieldUniversalIdentifier) ||
    (isPlainObject(value) && value.isCurrentWorkspaceMemberSelected === true)
  );
};
