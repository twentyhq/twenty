import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated/graphql';

export const isFieldWidget = (
  widget: PageLayoutWidget,
): widget is PageLayoutWidget & {
  type: typeof WidgetType.FIELD;
  configuration: FieldConfiguration;
} => {
  return (
    widget.type === WidgetType.FIELD &&
    isDefined(widget.configuration) &&
    widget.configuration.__typename === 'FieldConfiguration'
  );
};
