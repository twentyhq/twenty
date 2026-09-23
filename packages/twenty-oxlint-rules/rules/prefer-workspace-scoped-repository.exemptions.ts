// Kept free of imports: twenty-server's exemptions spec loads this module.
//
// Removing an entity from WORKSPACE_SCOPED_EXEMPTIONS can surface raw
// injections sitting in frozen upgrade-version-command directories, which
// cannot take an in-file suppression. twenty-server/.oxlintrc.json turns the
// rule off for the directories that need it; extend that list if a migration
// reports a violation under one.
// Entities that do not fit the scoped wrapper: workspace itself,
// nullable-workspaceId rows (instance-level config / migrations / tokens),
// and global tables with no workspaceId column at all.
export const STRUCTURAL_EXEMPTIONS = [
  'WorkspaceEntity',

  // nullable workspaceId — both rows support instance-level and per-workspace use
  'KeyValuePairEntity',
  'UpgradeMigrationEntity',
  'AppTokenEntity',
  // user-scoped auth sessions; workspaceId is null for workspace-agnostic sessions
  'UserSessionEntity',
  'ApplicationRegistrationEntity',

  'ApplicationRegistrationVariableEntity',
  'BillingMeterEntity',
  'BillingPriceEntity',
  'BillingProductEntity',
  'BillingSubscriptionItemEntity',
  'SigningKeyEntity',
  'UserEntity',
] as const;

// Workspace-scoped entities the wrapper could technically wrap, but where
// the dominant access patterns are cross-workspace (request routing, auth,
// metadata sync, file storage, transaction-bound channel updates) and the
// payoff doesn't justify dual-injecting every call site or growing the
// wrapper API. Treat as a "deliberately not migrated" list, not a backlog.
export const WORKSPACE_SCOPED_EXEMPTIONS = [
  // Resolved by id alone at auth/request-routing time and inside file-storage
  // transactions; very few of the ~50 call sites carry a workspaceId.
  'ApplicationEntity',
  // Read by user across every workspace they belong to (the "apps you
  // authorized" screen) and from the OAuth token endpoint, which has no
  // request workspace to scope by.
  'ApplicationAuthorizationEntity',
  // 20+ call sites across calendar/messaging modules; staged for a dedicated PR.
  'CalendarChannelEntity',
  'MessageChannelEntity',
  // The domain column is globally unique across workspaces, so duplicate
  // preflight checks must query cross-workspace; writes stay on the wrapper.
  'EmailingDomainEntity',
  'UserWorkspaceEntity',
  'ConnectedAccountEntity',
  'MessageFolderEntity',
  'WorkspaceSsoIdentityProviderEntity',
] as const;
