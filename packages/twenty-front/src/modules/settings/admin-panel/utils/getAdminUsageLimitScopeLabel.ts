import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { getAdminUsageLimitOperationLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitOperationLabel';
import { getAdminUsageLimitResourceLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitResourceLabel';
import { getAdminUsageLimitSpenderLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitSpenderLabel';

export const getAdminUsageLimitScopeLabel = (row: AdminUsageLimitRow): string =>
  `${getAdminUsageLimitResourceLabel(row)} · ${getAdminUsageLimitOperationLabel(row)} · ${getAdminUsageLimitSpenderLabel(row)}`;
