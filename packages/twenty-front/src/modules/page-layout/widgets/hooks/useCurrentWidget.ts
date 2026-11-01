import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useCurrentWidget = (): PageLayoutWidget => {
  const widget = useCurrentWidgetOrNull();

  assertIsDefinedOrThrow(
    widget,
    new Error(doNotTranslate('Current widget is not defined')),
  );

  return widget;
};
