import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const useCurrentWidget = (): PageLayoutWidget => {
  const widget = useCurrentWidgetOrNull();

  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
  assertIsDefinedOrThrow(widget, new Error('Current widget is not defined'));

  return widget;
};
