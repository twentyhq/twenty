import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

import { PageLayoutComponentInstanceContext } from '../contexts/PageLayoutComponentInstanceContext';

export const recordTableWidgetViewDraftByWidgetIdComponentFamilySelector =
  createAtomComponentFamilySelector<
    RecordTableWidgetViewSnapshot | undefined,
    { widgetId: string }
  >({
    key: 'recordTableWidgetViewDraftByWidgetIdComponentFamilySelector',
    componentInstanceContext: PageLayoutComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const draftMap = get(recordTableWidgetViewDraftComponentState, {
          instanceId,
        });

        return draftMap[familyKey.widgetId];
      },
  });
