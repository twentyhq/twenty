import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isNonEmptyString } from '@sniptt/guards';

// An empty id is no more a view than a missing one.
export const getWidgetConfigurationViewId = (
  configuration: PageLayoutWidget['configuration'],
): string | null => {
  if ('viewId' in configuration && isNonEmptyString(configuration.viewId)) {
    return configuration.viewId;
  }

  return null;
};
