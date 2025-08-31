import { useCallback } from 'react';
import { type Layouts } from 'react-grid-layout';
import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { type Widget } from '../mocks/mockWidgets';
import { convertLayoutsToWidgets } from '../utils/convertLayoutsToWidgets';
import { type PageLayoutFormData } from './usePageLayoutFormState';

export const usePageLayoutWidgetUpdateFromLayouts = (
  getValues: UseFormGetValues<PageLayoutFormData>,
  setValue: UseFormSetValue<PageLayoutFormData>,
) => {
  const updateWidgetsFromLayouts = useCallback(
    (layouts: Layouts) => {
      const widgets = getValues('widgets');
      const widgetData = widgets.map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
        graphType: w.graphType,
        data: w.data,
      })) as Widget[];
      const updatedWidgets = convertLayoutsToWidgets(widgetData, layouts);
      setValue('widgets', updatedWidgets);
    },
    [setValue, getValues],
  );

  return { updateWidgetsFromLayouts };
};
