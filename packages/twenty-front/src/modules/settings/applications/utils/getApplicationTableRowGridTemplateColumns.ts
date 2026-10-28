import { APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS_BY_MIDDLE_COLUMN } from '@/settings/applications/constants/ApplicationTableRowGridTemplateColumnsByMiddleColumn';
import { APPLICATION_TABLE_ROW_MOBILE_GRID_TEMPLATE_COLUMNS } from '@/settings/applications/constants/ApplicationTableRowMobileGridTemplateColumns';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';

export const getApplicationTableRowGridTemplateColumns = ({
  middleColumn,
  isMobile,
}: {
  middleColumn: SettingsApplicationTableRowMiddleColumn;
  isMobile: boolean;
}) =>
  isMobile
    ? APPLICATION_TABLE_ROW_MOBILE_GRID_TEMPLATE_COLUMNS
    : APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS_BY_MIDDLE_COLUMN[
        middleColumn
      ];
