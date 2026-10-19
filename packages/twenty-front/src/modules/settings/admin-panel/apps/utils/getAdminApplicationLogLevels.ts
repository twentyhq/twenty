import { ADMIN_APPLICATION_LOG_LEVEL_FILTERS } from '@/settings/admin-panel/apps/constants/AdminApplicationLogLevelFilters';
import { type AdminApplicationLogLevelFilter } from '@/settings/admin-panel/apps/types/AdminApplicationLogLevelFilter';

export const getAdminApplicationLogLevels = (
  levelFilter: AdminApplicationLogLevelFilter,
): string[] | undefined =>
  ADMIN_APPLICATION_LOG_LEVEL_FILTERS.find(
    (filter) => filter.value === levelFilter,
  )?.levels;
