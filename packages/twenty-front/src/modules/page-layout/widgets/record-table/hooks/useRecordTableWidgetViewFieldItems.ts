import { useMapViewFieldToRecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/hooks/useMapViewFieldToRecordTableWidgetViewFieldItem';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
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
  pageLayoutId,
}: UseRecordTableWidgetViewFieldItemsParams) => {
  const { view } = useRecordTableWidgetViewForDisplay({
    viewId,
    widgetId,
    pageLayoutId,
  });

  const { mapViewFieldToRecordTableWidgetViewFieldItem } =
    useMapViewFieldToRecordTableWidgetViewFieldItem();

  const recordTableWidgetViewFieldItems: RecordTableWidgetViewFieldItem[] =
    useMemo(() => {
      if (!isDefined(view)) {
        return [];
      }

      return view.viewFields
        .toSorted(sortByProperty('position'))
        .map(mapViewFieldToRecordTableWidgetViewFieldItem)
        .filter(isDefined);
    }, [view, mapViewFieldToRecordTableWidgetViewFieldItem]);

  return { recordTableWidgetViewFieldItems };
};
