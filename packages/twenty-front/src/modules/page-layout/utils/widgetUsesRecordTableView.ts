import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { FieldDisplayMode, WidgetType } from '~/generated-metadata/graphql';

export const widgetUsesRecordTableView = (
  widget: PageLayoutWidget,
): boolean => {
  if (widget.type === WidgetType.RECORD_TABLE) {
    return true;
  }

  return (
    isFieldWidget(widget) &&
    widget.configuration.fieldDisplayMode === FieldDisplayMode.TABLE
  );
};
