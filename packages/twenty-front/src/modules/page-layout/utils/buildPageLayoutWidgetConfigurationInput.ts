import { removeTypenamesFromCompositeFieldValue } from '@/object-record/utils/removeTypenamesFromCompositeFieldValue';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';

// The editor's type guards read __typename from state, so it is only removed on the wire
export const buildPageLayoutWidgetConfigurationInput = (
  configuration: PageLayoutWidget['configuration'] | null | undefined,
): Record<string, unknown> | null => {
  if (!isDefined(configuration)) {
    return null;
  }

  return removeTypenamesFromCompositeFieldValue(configuration) as Record<
    string,
    unknown
  >;
};
