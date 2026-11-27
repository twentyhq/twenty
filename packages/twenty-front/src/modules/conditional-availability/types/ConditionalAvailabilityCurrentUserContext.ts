export type ConditionalAvailabilityCurrentUserContext = {
  featureFlags: Record<string, boolean>;
  permissionFlags: Record<string, boolean>;
  currentRole: { universalIdentifier: string | null };
  currentWorkspaceMember: { id: string | null };
};
