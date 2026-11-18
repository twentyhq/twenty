// Multi-workspace instances let anyone sign up with any address, so an unverified address is only trusted on single-workspace ones
export const requiresInvitationLinkToJoin = ({
  isEmailVerified,
  isEmailVerificationRequired,
  isMultiWorkspaceEnabled,
}: {
  isEmailVerified: boolean;
  isEmailVerificationRequired: boolean;
  isMultiWorkspaceEnabled: boolean;
}): boolean =>
  !isEmailVerified && (isEmailVerificationRequired || isMultiWorkspaceEnabled);
