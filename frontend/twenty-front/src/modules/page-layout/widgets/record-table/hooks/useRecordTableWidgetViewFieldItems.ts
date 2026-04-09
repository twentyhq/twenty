import { useMapViewFieldToRecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/hooks/useMapViewFieldToRecordTableWidgetViewFieldItem';
import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
import { useViewById } from '@/views/hooks/useViewById';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useRecordTableWidgetViewFieldItems = (viewId: string) => {
  const { view } = useViewById(viewId);
  const { mapViewFieldToRecordTableWidgetViewFieldItem } =
    useMapViewFieldToRecordTableWidgetViewFieldItem();

  const recordTableWidgetViewFieldItems: RecordTableWidgetViewFieldItem[] =
    useMemo(() => {
      if (!view) {
        return [];
      }

      return view.viewFields
        .toSorted(sortByProperty('position'))
        .map(mapViewFieldToRecordTableWidgetViewFieldItem)
        .filter(isDefined);
    }, [view, mapViewFieldToRecordTableWidgetViewFieldItem]);

  return { recordTableWidgetViewFieldItems };
};
