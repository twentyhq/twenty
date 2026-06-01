export const SHAHRYAR_APP_PATHS = {
  Dashboard: '/shahryar/dashboard',
  Markets: '/shahryar/markets',
  SupervisorVisits: '/shahryar/supervisor-visits',
  WorkingTimes: '/shahryar/working-times',
  Reports: '/shahryar/reports',
  Admin: '/shahryar/admin',
  MobileApp: '/shahryar/mobile',
  Payments: '/shahryar/payments',
  SupervisorPenalties: '/shahryar/supervisor-penalties',
  Absences: '/shahryar/absences',
  Backups: '/shahryar/backups',
} as const;

export type ShahryarAppPath =
  (typeof SHAHRYAR_APP_PATHS)[keyof typeof SHAHRYAR_APP_PATHS];
