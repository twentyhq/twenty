import { msg } from '@lingui/core/macro';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const WORKSPACE_MEMBER_NON_CUSTOM_UPDATE_FIELD_ALLOWLIST = new Set<string>(
  Object.keys(STANDARD_OBJECTS.workspaceMember.fields),
);

export const assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly = ({
  update,
}: {
  update: Record<string, unknown>;
}): void => {
  const updateKeys = Object.keys(update);

  if (updateKeys.length === 0) {
    throw new UserInputError('Update payload cannot be empty', {
      userFriendlyMessage: msg`Add at least one field to update.`,
    });
  }

  for (const payloadKey of updateKeys) {
    if (!WORKSPACE_MEMBER_NON_CUSTOM_UPDATE_FIELD_ALLOWLIST.has(payloadKey)) {
      throw new UserInputError(
        `Cannot update custom workspaceMember field via this endpoint: ${payloadKey}`,
        {
          userFriendlyMessage: msg`"${payloadKey}" is not a valid workspace member field.`,
        },
      );
    }
  }
};
