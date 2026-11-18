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
