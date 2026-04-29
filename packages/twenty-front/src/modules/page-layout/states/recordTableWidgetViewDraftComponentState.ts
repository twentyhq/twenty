import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const recordTableWidgetViewDraftComponentState =
  createAtomComponentState<Record<string, RecordTableWidgetViewSnapshot>>({
    key: 'recordTableWidgetViewDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
