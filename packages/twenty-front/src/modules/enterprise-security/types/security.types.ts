export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export type DeviceSession = {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  browser: string;
  ipAddress: string;
  location: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
};

export type AuditAction =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'role_change'
  | 'data_export'
  | 'record_delete'
  | 'setting_update';

export type AuditLogEntry = {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  details: string;
  ipAddress: string;
  createdAt: string;
};

export type TwoFactorStats = {
  totalUsers: number;
  enabledCount: number;
  pendingCount: number;
  disabledCount: number;
  adoptionPercentage: number;
};

export type TwoFactorUser = {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  enrolledAt: string | null;
};
