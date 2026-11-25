import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const isFieldWidget = <
  TWidget extends Pick<PageLayoutWidget, 'type' | 'configuration'>,
>(
  widget: TWidget,
): widget is TWidget & {
  type: typeof WidgetType.FIELD;
  configuration: FieldConfiguration;
} => {
  return (
    widget.type === WidgetType.FIELD &&
    isDefined(widget.configuration) &&
    widget.configuration.__typename === 'FieldConfiguration'
  );
};
