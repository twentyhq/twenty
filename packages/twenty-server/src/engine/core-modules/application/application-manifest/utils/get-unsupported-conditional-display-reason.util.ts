import { isArray } from '@sniptt/guards';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import {
  isDefined,
  isNonEmptyArray,
  isPlainObject,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';

import { getConditionalDisplayRoleUniversalIdentifiers } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-conditional-display-role-universal-identifiers.util';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const PORTABLE_ROLE_UNIVERSAL_IDENTIFIERS = [
  MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
  STANDARD_ROLE.admin.universalIdentifier,
];

const hasSpecificWorkspaceMemberSelection = (
  recordFilters: unknown[],
): boolean =>
  recordFilters.some((recordFilter) => {
    if (
      !isPlainObject(recordFilter) ||
      recordFilter.contextKey !== 'currentWorkspaceMemberId'
    ) {
      return false;
    }

    const parsedValue = jsonRelationFilterValueSchema.safeParse(
      recordFilter.value,
    );

    return (
      !parsedValue.success ||
      isNonEmptyArray(parsedValue.data.selectedRecordIds)
    );
  });

export const getUnsupportedConditionalDisplayReason = ({
  entityLabel,
  universalConditionalDisplay,
}: {
  entityLabel: string;
  universalConditionalDisplay: unknown;
}): string | undefined => {
  if (!isDefined(universalConditionalDisplay)) {
    return undefined;
  }

  if (
    !isPlainObject(universalConditionalDisplay) ||
    !isArray(universalConditionalDisplay.recordFilters)
  ) {
    return `${entityLabel} with a conditional display in a format the sync does not support`;
  }

  const hasWorkspaceSpecificRole =
    getConditionalDisplayRoleUniversalIdentifiers(
      universalConditionalDisplay,
    ).some(
      (roleUniversalIdentifier) =>
        !PORTABLE_ROLE_UNIVERSAL_IDENTIFIERS.includes(roleUniversalIdentifier),
    );

  if (hasWorkspaceSpecificRole) {
    return `${entityLabel} with a conditional display referencing a workspace-specific role`;
  }

  if (
    hasSpecificWorkspaceMemberSelection(
      universalConditionalDisplay.recordFilters,
    )
  ) {
    return `${entityLabel} with a conditional display naming specific workspace members`;
  }

  return undefined;
};
