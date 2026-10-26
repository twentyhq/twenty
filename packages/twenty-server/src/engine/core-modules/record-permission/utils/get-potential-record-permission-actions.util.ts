import { RECORD_PERMISSION_ACTIONS } from 'twenty-shared/constants';
import { type RecordPermissionAction } from 'twenty-shared/types';

import { type RecordPermissionContext } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';

// Navigation needs to expose objects reachable through conditional or received grants.
// Actual record access is always evaluated by the ORM.
export const getPotentialRecordPermissionActions = ({
  context,
  objectUniversalIdentifier,
  roleUniversalIdentifier,
  depth = 0,
}: {
  context: Pick<
    RecordPermissionContext,
    'definition' | 'capabilitiesByObjectUniversalIdentifier'
  >;
  objectUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  depth?: number;
}): Set<RecordPermissionAction> => {
  const allowed = new Set<RecordPermissionAction>();
  const object = context.definition.objects.find(
    (policy) => policy.objectUniversalIdentifier === objectUniversalIdentifier,
  );

  if (!object || depth > 3) return allowed;
  for (const rule of object.rules.filter(
    (rule) => rule.roleUniversalIdentifier === roleUniversalIdentifier,
  )) {
    for (const action of rule.actions.includes('receive')
      ? RECORD_PERMISSION_ACTIONS
      : rule.actions)
      allowed.add(action);
  }
  for (const path of object.inheritancePaths) {
    for (const action of getPotentialRecordPermissionActions({
      context,
      objectUniversalIdentifier: path.sourceObjectUniversalIdentifier,
      roleUniversalIdentifier,
      depth: depth + path.fieldUniversalIdentifiers.length,
    }))
      allowed.add(action);
  }
  for (const action of allowed) {
    if (
      context.capabilitiesByObjectUniversalIdentifier[
        objectUniversalIdentifier
      ]?.[action] === false
    )
      allowed.delete(action);
  }
  return allowed;
};
