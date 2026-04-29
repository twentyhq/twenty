import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const recordTableWidgetViewPersistedComponentState =
  createAtomComponentState<Record<string, RecordTableWidgetViewSnapshot>>({
    key: 'recordTableWidgetViewPersistedComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
