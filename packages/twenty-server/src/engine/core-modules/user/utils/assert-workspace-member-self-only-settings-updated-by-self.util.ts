import { msg } from '@lingui/core/macro';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';

const SELF_ONLY_WORKSPACE_MEMBER_SETTING_FIELD_NAMES = new Set<string>([
  'inboxNotificationLevel',
  'isInboxNotificationPreviewEnabled',
]);

export const assertWorkspaceMemberSelfOnlySettingsUpdatedBySelf = ({
  update,
  isUpdatingSelf,
}: {
  update: Record<string, unknown>;
  isUpdatingSelf: boolean;
}): void => {
  if (
    isUpdatingSelf ||
    !Object.keys(update).some((fieldName) =>
      SELF_ONLY_WORKSPACE_MEMBER_SETTING_FIELD_NAMES.has(fieldName),
    )
  ) {
    return;
  }

  throw new PermissionsException(
    PermissionsExceptionMessage.PERMISSION_DENIED,
    PermissionsExceptionCode.PERMISSION_DENIED,
    {
      userFriendlyMessage: msg`Only members can change their own notification settings.`,
    },
  );
};
