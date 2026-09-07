export const getWidgetViewLayoutSettingsItemIds = ({
  isCalendarLayout,
  hasGroupBy,
  isLayoutRowHidden = false,
}: {
  isCalendarLayout: boolean;
  hasGroupBy: boolean;
  isLayoutRowHidden?: boolean;
}) => [
  ...(isLayoutRowHidden ? [] : ['object-view-layout']),
  ...(isCalendarLayout
    ? ['record-table-calendar-field', 'record-table-calendar-layout']
    : ['record-table-group-by']),
  ...(!isCalendarLayout && hasGroupBy
    ? ['record-table-hide-empty-groups']
    : []),
];
