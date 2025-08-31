import { useCallback } from 'react';
import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { type PageLayoutFormData } from './usePageLayoutFormState';

export const usePageLayoutWidgetRemove = (
  getValues: UseFormGetValues<PageLayoutFormData>,
  setValue: UseFormSetValue<PageLayoutFormData>,
) => {
  const removeWidget = useCallback(
    (widgetId: string) => {
      const currentWidgets = getValues('widgets');
      setValue(
        'widgets',
        currentWidgets.filter((w) => w.id !== widgetId),
      );
    },
    [getValues, setValue],
  );

  return { removeWidget };
};
