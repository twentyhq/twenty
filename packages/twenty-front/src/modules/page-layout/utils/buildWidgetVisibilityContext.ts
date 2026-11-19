import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import {
  type ConditionalAvailabilityGlobalContext,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type BuildWidgetVisibilityContextParams = {
  globalContext: ConditionalAvailabilityGlobalContext;
  isMobile: boolean;
  isInSidePanel: boolean;
  targetRecord?: ObjectRecord;
};

export const buildWidgetVisibilityContext = ({
  globalContext,
  isMobile,
  isInSidePanel,
  targetRecord,
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    ...globalContext,
    device: isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP',
    // Plural to share the command menu grammar; empty when absent so record-gated widgets stay hidden until load.
    selectedRecords: isDefined(targetRecord) ? [targetRecord] : [],
  };
};
