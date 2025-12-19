import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetType } from '~/generated/graphql';

export const isFieldWidget = (
  widget: PageLayoutWidget,
): widget is PageLayoutWidget & {
  type: typeof WidgetType.FIELD;
  configuration: { fieldMetadataId: string };
} => {
  return (
    widget.type === WidgetType.FIELD &&
    widget.configuration !== null &&
    widget.configuration !== undefined &&
    'fieldMetadataId' in widget.configuration
  );
};
