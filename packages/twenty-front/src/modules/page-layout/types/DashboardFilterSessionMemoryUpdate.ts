export type DashboardFilterSessionMemoryUpdate =
  | { type: 'NONE' }
  | { type: 'REMEMBER'; dashboardFilterSearch: string }
  | { type: 'RESTORE'; search: string };
