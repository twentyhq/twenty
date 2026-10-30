import { APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS_BY_MIDDLE_COLUMN } from '@/settings/applications/constants/ApplicationTableRowGridTemplateColumnsByMiddleColumn';
import { APPLICATION_TABLE_ROW_MOBILE_GRID_TEMPLATE_COLUMNS } from '@/settings/applications/constants/ApplicationTableRowMobileGridTemplateColumns';
import { APPLICATION_TABLE_ROW_MOBILE_WITH_DETAILS_GRID_TEMPLATE_COLUMNS } from '@/settings/applications/constants/ApplicationTableRowMobileWithDetailsGridTemplateColumns';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';

export const getApplicationTableRowGridTemplateColumns = ({
  middleColumn,
  isMobile,
  shouldShowDetailsOnMobile = false,
}: {
  middleColumn: SettingsApplicationTableRowMiddleColumn;
  isMobile: boolean;
  shouldShowDetailsOnMobile?: boolean;
}) => {
  if (!isMobile) {
    return APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS_BY_MIDDLE_COLUMN[
      middleColumn
    ];
  }

  return shouldShowDetailsOnMobile
    ? APPLICATION_TABLE_ROW_MOBILE_WITH_DETAILS_GRID_TEMPLATE_COLUMNS
    : APPLICATION_TABLE_ROW_MOBILE_GRID_TEMPLATE_COLUMNS;
};
