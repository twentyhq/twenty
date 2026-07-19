// Workspace-scoped upgrade failures only affect the failed tenant.
// Instance/schema-level failures throw earlier and are always fatal.
//
// On a single-workspace instance the failed workspace is the product, so
// continuing would serve a half-migrated schema (live 500s behind a green
// deploy). On multi-workspace, or when explicitly opted out, tolerate the
// failure so healthy tenants stay available and re-run later via upgrade status.
export const shouldTolerateUpgradeWorkspaceFailures = ({
  isMultiWorkspaceEnabled,
  continueOnError,
}: {
  isMultiWorkspaceEnabled: boolean;
  continueOnError: boolean;
}): boolean => isMultiWorkspaceEnabled || continueOnError;
