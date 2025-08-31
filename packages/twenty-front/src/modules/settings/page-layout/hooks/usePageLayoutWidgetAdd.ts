import { useCallback } from 'react';
import { type Layout } from 'react-grid-layout';
import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { type Widget } from '../mocks/mockWidgets';
import { type PageLayoutFormData } from './usePageLayoutFormState';

export const usePageLayoutWidgetAdd = (
  getValues: UseFormGetValues<PageLayoutFormData>,
  setValue: UseFormSetValue<PageLayoutFormData>,
) => {
  const addWidget = useCallback(
    (widget: Widget, layout: Layout) => {
      const currentWidgets = getValues('widgets');
      const newWidget = {
        ...widget,
        gridPosition: {
          row: layout.y,
          column: layout.x,
          rowSpan: layout.h,
          columnSpan: layout.w,
        },
      };
      setValue('widgets', [...currentWidgets, newWidget]);
    },
    [getValues, setValue],
  );

  return { addWidget };
};
