import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';

export const APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS_BY_MIDDLE_COLUMN: Record<
  SettingsApplicationTableRowMiddleColumn,
  string
> = {
  type: '200px 80px minmax(0, 1fr) 36px',
  status: '200px 180px minmax(0, 1fr) 36px',
};
