import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useMapViewFieldToRecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/hooks/useMapViewFieldToRecordTableWidgetViewFieldItem';
import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

type UseRecordTableWidgetViewFieldItemsParams = {
  viewId: string;
  widgetId: string;
  pageLayoutId: string;
};

export const useRecordTableWidgetViewFieldItems = ({
  viewId,
  widgetId,
}: UseRecordTableWidgetViewFieldItemsParams) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
  );

  const draftSnapshot = recordTableWidgetViewDraft[widgetId];

  const { view } = useViewById(viewId);
  const { mapViewFieldToRecordTableWidgetViewFieldItem } =
    useMapViewFieldToRecordTableWidgetViewFieldItem();

  const recordTableWidgetViewFieldItems: RecordTableWidgetViewFieldItem[] =
    useMemo(() => {
      if (isPageLayoutInEditMode && isDefined(draftSnapshot)) {
        return draftSnapshot.viewFields
          .toSorted(sortByProperty('position'))
          .map(mapViewFieldToRecordTableWidgetViewFieldItem)
          .filter(isDefined);
      }

      if (!view) {
        return [];
      }

      return view.viewFields
        .toSorted(sortByProperty('position'))
        .map(mapViewFieldToRecordTableWidgetViewFieldItem)
        .filter(isDefined);
    }, [
      isPageLayoutInEditMode,
      draftSnapshot,
      view,
      mapViewFieldToRecordTableWidgetViewFieldItem,
    ]);

  return { recordTableWidgetViewFieldItems };
};
