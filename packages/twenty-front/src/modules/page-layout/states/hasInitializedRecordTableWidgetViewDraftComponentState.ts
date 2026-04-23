import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const hasInitializedRecordTableWidgetViewDraftComponentState =
  createAtomComponentState<Record<string, boolean>>({
    key: 'hasInitializedRecordTableWidgetViewDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
