import { requiresInvitationLinkToJoin } from 'src/engine/core-modules/workspace-invitation/utils/requires-invitation-link-to-join.util';

describe('requiresInvitationLinkToJoin', () => {
  it.each([
    { isEmailVerificationRequired: false, isMultiWorkspaceEnabled: false },
    { isEmailVerificationRequired: true, isMultiWorkspaceEnabled: false },
    { isEmailVerificationRequired: false, isMultiWorkspaceEnabled: true },
    { isEmailVerificationRequired: true, isMultiWorkspaceEnabled: true },
  ])('never requires the link for a verified email (%o)', (instanceConfig) => {
    expect(
      requiresInvitationLinkToJoin({
        isEmailVerified: true,
        ...instanceConfig,
      }),
    ).toBe(false);
  });

  it('lets an unverified email join on a single-workspace instance without verification', () => {
    expect(
      requiresInvitationLinkToJoin({
        isEmailVerified: false,
        isEmailVerificationRequired: false,
        isMultiWorkspaceEnabled: false,
      }),
    ).toBe(false);
  });

  it('requires the link for an unverified email when verification is required', () => {
    expect(
      requiresInvitationLinkToJoin({
        isEmailVerified: false,
        isEmailVerificationRequired: true,
        isMultiWorkspaceEnabled: false,
      }),
    ).toBe(true);
  });

  it('requires the link for an unverified email on a multi-workspace instance', () => {
    expect(
      requiresInvitationLinkToJoin({
        isEmailVerified: false,
        isEmailVerificationRequired: false,
        isMultiWorkspaceEnabled: true,
      }),
    ).toBe(true);
  });
});
