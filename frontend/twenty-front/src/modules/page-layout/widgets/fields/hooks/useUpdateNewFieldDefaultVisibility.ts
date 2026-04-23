import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { useGetNewFieldDefaultVisibility } from '@/page-layout/widgets/fields/hooks/useGetNewFieldDefaultVisibility';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateNewFieldDefaultVisibilityParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useUpdateNewFieldDefaultVisibility = ({
  pageLayoutId,
  widgetId,
}: UseUpdateNewFieldDefaultVisibilityParams) => {
  const { newFieldDefaultVisibility, fieldsConfiguration } =
    useGetNewFieldDefaultVisibility({ pageLayoutId, widgetId });

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const updateNewFieldDefaultVisibility = useCallback(
    (isVisible: boolean) => {
      if (!isDefined(fieldsConfiguration)) {
        return;
      }

      updatePageLayoutWidget(widgetId, {
        configuration: {
          ...fieldsConfiguration,
          newFieldDefaultVisibility: isVisible,
        },
      });
    },
    [fieldsConfiguration, updatePageLayoutWidget, widgetId],
  );

  return { updateNewFieldDefaultVisibility, newFieldDefaultVisibility };
};
