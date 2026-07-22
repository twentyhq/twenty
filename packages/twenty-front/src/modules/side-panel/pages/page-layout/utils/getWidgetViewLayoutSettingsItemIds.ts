// The keyboard-selectable item ids WidgetViewLayoutSettingsRows renders, in
// render order, for the parent SidePanelList's selectableItemIds.
export const getWidgetViewLayoutSettingsItemIds = ({
  isCalendarLayout,
  isCalendarWeekViewEnabled,
  hasGroupBy,
  isLayoutRowHidden = false,
}: {
  isCalendarLayout: boolean;
  isCalendarWeekViewEnabled: boolean;
  hasGroupBy: boolean;
  isLayoutRowHidden?: boolean;
}) => [
  ...(isLayoutRowHidden ? [] : ['object-view-layout']),
  ...(isCalendarLayout
    ? [
        'record-table-calendar-field',
        ...(isCalendarWeekViewEnabled ? ['record-table-calendar-layout'] : []),
      ]
    : ['record-table-group-by']),
  ...(!isCalendarLayout && hasGroupBy
    ? ['record-table-hide-empty-groups']
    : []),
];
