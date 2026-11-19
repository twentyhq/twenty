import { assertWorkspaceMemberSelfOnlySettingsUpdatedBySelf } from 'src/engine/core-modules/user/utils/assert-workspace-member-self-only-settings-updated-by-self.util';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';

describe('assertWorkspaceMemberSelfOnlySettingsUpdatedBySelf', () => {
  it.each([
    { inboxNotificationLevel: 'NONE' },
    { isInboxNotificationPreviewEnabled: true },
  ])('should let members change their own %o', (update) => {
    expect(() =>
      assertWorkspaceMemberSelfOnlySettingsUpdatedBySelf({
        update,
        isUpdatingSelf: true,
      }),
    ).not.toThrow();
  });

  it.each([
    { inboxNotificationLevel: 'NONE' },
    { locale: 'fr-FR', isInboxNotificationPreviewEnabled: true },
  ])('should refuse %o on another member', (update) => {
    expect(() =>
      assertWorkspaceMemberSelfOnlySettingsUpdatedBySelf({
        update,
        isUpdatingSelf: false,
      }),
    ).toThrow(PermissionsException);
  });

  it('should let admins change the other settings of another member', () => {
    expect(() =>
      assertWorkspaceMemberSelfOnlySettingsUpdatedBySelf({
        update: { locale: 'fr-FR' },
        isUpdatingSelf: false,
      }),
    ).not.toThrow();
  });
});
