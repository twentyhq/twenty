import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export type CallRecordingSummaryHeaderData = {
  summaryMarkdown: string | undefined;
};

export const callRecordingSummaryHeaderDataComponentFamilyState =
  createAtomComponentFamilyState<CallRecordingSummaryHeaderData | null, string>(
    {
      key: 'callRecordingSummaryHeaderDataComponentFamilyState',
      defaultValue: null,
      componentInstanceContext: PageLayoutComponentInstanceContext,
    },
  );
