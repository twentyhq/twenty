import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { isDefined } from 'twenty-shared/utils';

type BuildWidgetVisibilityContextParams = {
  isMobile: boolean;
  isInSidePanel: boolean;
  // Deliberately the context's own record shape rather than ObjectRecord: the
  // expression evaluator reads arbitrary fields by name and never needs the
  // GraphQL metadata a full record carries.
  targetRecord?: Record<string, unknown>;
};

export const buildWidgetVisibilityContext = ({
  isMobile,
  isInSidePanel,
  targetRecord,
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    device: isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP',
    // A record page has one record, but the expression language names this
    // variable for list views where a selection can hold several. It stays
    // plural so page layouts and command menu items keep one shared grammar.
    // An absent record yields an empty selection, on which record predicates
    // are false — so a widget gated on the record stays hidden until it loads
    // rather than appearing and being taken away.
    selectedRecords: isDefined(targetRecord) ? [targetRecord] : [],
  };
};
