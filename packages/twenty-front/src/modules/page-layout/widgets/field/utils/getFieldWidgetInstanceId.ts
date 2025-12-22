export const getFieldWidgetInstanceId = ({
  recordId,
  fieldName,
  isInRightDrawer,
}: {
  recordId: string;
  fieldName: string;
  isInRightDrawer: boolean;
}): string => {
  return `field-widget-${recordId}-${fieldName}${isInRightDrawer ? '-right-drawer' : ''}`;
};
