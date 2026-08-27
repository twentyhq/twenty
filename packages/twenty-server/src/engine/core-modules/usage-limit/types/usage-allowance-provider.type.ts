// How much of the metered unit the workspace may consume this period, or null
// when nothing bounds it (self-host, billing disabled). Implemented by the
// billing module; the usage-limit module only consumes it.
export type UsageAllowanceProvider = {
  getUsageAllowance(workspaceId: string): Promise<number | null>;
};
