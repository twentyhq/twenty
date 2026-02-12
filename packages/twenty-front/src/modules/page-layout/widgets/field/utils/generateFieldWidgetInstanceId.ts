export const generateFieldWidgetInstanceId = ({
  widgetId,
  recordId,
  fieldName,
  isInRightDrawer,
}: {
  widgetId: string;
  recordId: string;
  fieldName: string;
  isInRightDrawer: boolean;
}): string => {
  return `${widgetId}-field-widget-${recordId}-${fieldName}${isInRightDrawer ? '-right-drawer' : ''}`;
};
