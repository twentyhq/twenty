import { msg } from '@lingui/core/macro';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

// Deny-by-default allowlist of self-service settings: lifecycle, audit and email columns (notably deletedAt) and relations must go through their own flow.
const WORKSPACE_MEMBER_SETTINGS_UPDATE_ALLOWED_FIELD_NAMES = new Set<string>([
  'name',
  'colorScheme',
  'uiScale',
  'openRecordIn',
  'locale',
  'avatarUrl',
  'jobTitle',
  'calendarStartDay',
  'timeZone',
  'dateFormat',
  'timeFormat',
  'numberFormat',
]);

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
    if (!WORKSPACE_MEMBER_SETTINGS_UPDATE_ALLOWED_FIELD_NAMES.has(payloadKey)) {
      throw new UserInputError(
        `Cannot update custom workspaceMember field via this endpoint: ${payloadKey}`,
        {
          userFriendlyMessage: msg`"${payloadKey}" is not a valid workspace member field.`,
        },
      );
    }
  }
};
