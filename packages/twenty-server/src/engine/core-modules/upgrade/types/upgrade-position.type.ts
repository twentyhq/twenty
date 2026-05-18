// Snapshot of which upgrade commands have been applied to the instance at a
// given moment. The full set is read from `core.upgradeMigration` (rows with
// status='completed' and workspaceId IS NULL). Outside an active upgrade run
// the registry exposes a position with all known commands marked applied, so
// upgrade-aware decorators become no-ops.

export type UpgradePosition = {
  appliedCommandNames: ReadonlySet<string>;
};
