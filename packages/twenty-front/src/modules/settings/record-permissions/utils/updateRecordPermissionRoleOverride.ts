import {
  type ObjectRecordPermissionPolicy,
  type RecordPermissionPolicyDefinition,
} from 'twenty-shared/types';

export const updateRecordPermissionRoleOverride = ({
  definition,
  policy,
  roleUniversalIdentifier,
}: {
  definition: RecordPermissionPolicyDefinition;
  policy: ObjectRecordPermissionPolicy;
  roleUniversalIdentifier: string;
}): RecordPermissionPolicyDefinition => {
  const previous = definition.objects.find(
    (object) =>
      object.objectUniversalIdentifier === policy.objectUniversalIdentifier,
  );
  return {
    ...definition,
    objects: [
      ...definition.objects.filter(
        (object) =>
          object.objectUniversalIdentifier !== policy.objectUniversalIdentifier,
      ),
      {
        ...policy,
        inheritancePaths: previous?.inheritancePaths ?? policy.inheritancePaths,
        rules: [
          ...(previous?.rules ?? []).filter(
            (rule) => rule.roleUniversalIdentifier !== roleUniversalIdentifier,
          ),
          ...policy.rules.filter(
            (rule) => rule.roleUniversalIdentifier === roleUniversalIdentifier,
          ),
        ],
        defaultOverrideRoleUniversalIdentifiers: [
          ...new Set([
            ...(previous?.defaultOverrideRoleUniversalIdentifiers ?? []),
            roleUniversalIdentifier,
          ]),
        ],
      },
    ],
  };
};
