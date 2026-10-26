import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

export const hasRecordPermissionConditionChanges = (
  definition: RecordPermissionPolicyDefinition,
  activeDefinition?: RecordPermissionPolicyDefinition,
): boolean => {
  const activeRules = new Map(
    activeDefinition?.objects.flatMap((object) =>
      object.rules.map(
        (rule) =>
          [
            `${object.objectUniversalIdentifier}:${rule.universalIdentifier}`,
            rule,
          ] as const,
      ),
    ),
  );

  return definition.objects.some((object) =>
    object.rules.some(
      (rule) =>
        isDefined(rule.condition) &&
        !fastDeepEqual(
          rule,
          activeRules.get(
            `${object.objectUniversalIdentifier}:${rule.universalIdentifier}`,
          ),
        ),
    ),
  );
};
