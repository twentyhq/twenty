import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isNonEmptyString } from '@sniptt/guards';

// The single answer to "does this widget have a view to render?", so callers
// cannot disagree over an empty id — which is no more a view than a missing
// one, and would otherwise be committed to as if it were.
export const getWidgetConfigurationViewId = (
  configuration: PageLayoutWidget['configuration'],
): string | null => {
  if ('viewId' in configuration && isNonEmptyString(configuration.viewId)) {
    return configuration.viewId;
  }

  return null;
};
