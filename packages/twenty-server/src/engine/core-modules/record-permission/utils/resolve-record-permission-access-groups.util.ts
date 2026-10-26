import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import {
  type RecordPermissionAccessGroup,
  type RecordPermissionAuthority,
  type RecordPermissionMetadata,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { bindRecordPermissionCondition } from 'src/engine/core-modules/record-permission/utils/bind-record-permission-condition.util';

export const resolveRecordPermissionAccessGroups = ({
  revisionId,
  definition,
  authority,
  metadata,
  ruleUniversalIdentifier,
}: {
  revisionId: string;
  definition: RecordPermissionPolicyDefinition;
  authority: RecordPermissionAuthority;
  metadata: RecordPermissionMetadata;
  ruleUniversalIdentifier?: string;
}): RecordPermissionAccessGroup[] => {
  const inheritsFrom = (
    target: string,
    source: string,
    depth = 0,
    visited: string[] = [],
  ): boolean => {
    if (depth > 3 || visited.includes(target)) return false;
    if (target === source) return true;
    return (
      definition.objects
        .find((object) => object.objectUniversalIdentifier === target)
        ?.inheritancePaths.some((path) =>
          inheritsFrom(
            path.sourceObjectUniversalIdentifier,
            source,
            depth + path.fieldUniversalIdentifiers.length,
            [...visited, target],
          ),
        ) ?? false
    );
  };
  return definition.objects.flatMap((objectPolicy) =>
    objectPolicy.rules
      .filter(
        (rule) =>
          rule.roleUniversalIdentifier === authority.roleUniversalIdentifier &&
          (!isDefined(ruleUniversalIdentifier) ||
            rule.universalIdentifier === ruleUniversalIdentifier),
      )
      .flatMap((rule) => {
        const filter = bindRecordPermissionCondition({
          condition: rule.condition,
          authority,
          metadata,
          objectUniversalIdentifier: objectPolicy.objectUniversalIdentifier,
        });
        const base = {
          roleUniversalIdentifier: authority.roleUniversalIdentifier,
          sourceObjectUniversalIdentifier:
            objectPolicy.objectUniversalIdentifier,
          rule,
          filter,
        };
        const ruleGroup: RecordPermissionAccessGroup = {
          ...base,
          id: v5(
            JSON.stringify([rule.universalIdentifier, filter]),
            revisionId,
          ),
          sharePrincipalIds: null,
        };

        if (!rule.actions.includes('receive')) {
          return [ruleGroup];
        }

        const targets = definition.objects.filter(
          (target) =>
            (target.objectUniversalIdentifier ===
              objectPolicy.objectUniversalIdentifier ||
              !target.rules.some(
                (targetRule) =>
                  targetRule.roleUniversalIdentifier ===
                    authority.roleUniversalIdentifier &&
                  targetRule.condition === null &&
                  targetRule.actions.includes('receive'),
              )) &&
            inheritsFrom(
              target.objectUniversalIdentifier,
              objectPolicy.objectUniversalIdentifier,
            ),
        );
        return [
          ruleGroup,
          ...targets.flatMap((target) =>
            [
              EVERYONE_PRINCIPAL_ID,
              authority.roleId,
              authority.workspaceMember?.id,
            ]
              .filter(isDefined)
              .map((principalId) => {
                const isDirect =
                  target.objectUniversalIdentifier ===
                  objectPolicy.objectUniversalIdentifier;
                return {
                  ...base,
                  sourceObjectUniversalIdentifier:
                    target.objectUniversalIdentifier,
                  receiveSourceObjectUniversalIdentifier:
                    objectPolicy.objectUniversalIdentifier,
                  id: v5(
                    JSON.stringify([
                      rule.universalIdentifier,
                      filter,
                      principalId,
                      ...(isDirect ? [] : [target.objectUniversalIdentifier]),
                    ]),
                    revisionId,
                  ),
                  sharePrincipalIds: [principalId],
                };
              }),
          ),
        ];
      }),
  );
};
