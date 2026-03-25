export const generateFieldWidgetInstanceId = ({
  widgetId,
  recordId,
  fieldName,
  isInSidePanel,
}: {
  widgetId: string;
  recordId: string;
  fieldName: string;
  isInSidePanel: boolean;
}): string => {
  return `${widgetId}-field-widget-${recordId}-${fieldName}${isInSidePanel ? '-side-panel' : ''}`;
};
