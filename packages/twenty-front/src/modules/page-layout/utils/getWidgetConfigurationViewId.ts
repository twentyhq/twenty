import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const getWidgetConfigurationViewId = (
  configuration: PageLayoutWidget['configuration'],
): string | null => {
  if ('viewId' in configuration && typeof configuration.viewId === 'string') {
    return configuration.viewId;
  }

  return null;
};
