import { isArray } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { PORTABLE_ROLE_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-manifest/constants/portable-role-universal-identifiers.constant';
import { hasSpecificWorkspaceMemberSelection } from 'src/engine/core-modules/application/application-manifest/utils/has-specific-workspace-member-selection.util';
import { getConditionalDisplayRoleUniversalIdentifiers } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-conditional-display-role-universal-identifiers.util';

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
