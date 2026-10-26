import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';

export const getRecordPermissionRoleDefinition = (
  definition: RecordPermissionPolicyDefinition,
  objectUniversalIdentifier: string,
): RecordPermissionPolicyDefinition => {
  const sources = new Set<string>();
  const visit = (identifier: string, depth: number) => {
    if (depth > 3) return;
    sources.add(identifier);
    for (const path of definition.objects.find(
      (object) => object.objectUniversalIdentifier === identifier,
    )?.inheritancePaths ?? []) {
      visit(
        path.sourceObjectUniversalIdentifier,
        depth + path.fieldUniversalIdentifiers.length,
      );
    }
  };
  visit(objectUniversalIdentifier, 0);

  // Direct and inherited source shares have their own sections in the panel.
  return {
    version: 1,
    objects: definition.objects
      .filter((object) => sources.has(object.objectUniversalIdentifier))
      .map((object) => ({
        ...object,
        rules: object.rules
          .map((rule) => ({
            ...rule,
            actions: rule.actions.filter(
              (action) => action === 'read' || action === 'update',
            ),
          }))
          .filter((rule) => rule.actions.length > 0),
      })),
  };
};
