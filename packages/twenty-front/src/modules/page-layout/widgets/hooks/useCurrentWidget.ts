import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const useCurrentWidget = (): PageLayoutWidget => {
  const widget = useCurrentWidgetOrNull();

  assertIsDefinedOrThrow(widget, new Error('Current widget is not defined'));

  return widget;
};
