import { msg } from '@lingui/core/macro';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

// The settings fields a member may set about themselves through this
// self-service endpoint. This is an explicit allowlist, so it is deny-by-default:
// identity (id, userId), audit/actor and lifecycle columns (createdAt,
// updatedAt, deletedAt, createdBy, updatedBy, position), the computed
// searchVector, relations, and any custom or future field are all rejected and
// must go through their own flow. Notably deletedAt is excluded so this
// endpoint cannot soft-delete a member and bypass the deletion flow and its
// last-admin protection.
const WORKSPACE_MEMBER_SETTINGS_UPDATE_ALLOWED_FIELD_NAMES = new Set<string>([
  'name',
  'colorScheme',
  'uiScale',
  'openRecordIn',
  'locale',
  'avatarUrl',
  'userEmail',
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
        `Cannot update workspaceMember field via this endpoint: ${payloadKey}`,
        {
          userFriendlyMessage: msg`"${payloadKey}" is not an editable workspace member setting.`,
        },
      );
    }
  }
};
