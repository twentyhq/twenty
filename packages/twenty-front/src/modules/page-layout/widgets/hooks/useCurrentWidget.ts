import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { assertIsDefinedOrThrow, doNotTranslate } from 'twenty-shared/utils';

export const useCurrentWidget = (): PageLayoutWidget => {
  const widget = useCurrentWidgetOrNull();

  assertIsDefinedOrThrow(
    widget,
    new Error(doNotTranslate('Current widget is not defined')),
  );

  return widget;
};
