import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { useGetNewFieldDefaultConfiguration } from '@/page-layout/widgets/fields/hooks/useGetNewFieldDefaultConfiguration';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateNewFieldDefaultConfigurationParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useUpdateNewFieldDefaultConfiguration = ({
  pageLayoutId,
  widgetId,
}: UseUpdateNewFieldDefaultConfigurationParams) => {
  const { newFieldDefaultConfiguration, fieldsConfiguration } =
    useGetNewFieldDefaultConfiguration({ pageLayoutId, widgetId });

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const updateNewFieldDefaultConfiguration = useCallback(
    (updates: { isVisible?: boolean; viewFieldGroupId?: string | null }) => {
      if (!isDefined(fieldsConfiguration)) {
        return;
      }

      updatePageLayoutWidget(widgetId, {
        configuration: {
          ...fieldsConfiguration,
          newFieldDefaultConfiguration: {
            ...newFieldDefaultConfiguration,
            ...updates,
          },
        },
      });
    },
    [
      fieldsConfiguration,
      newFieldDefaultConfiguration,
      updatePageLayoutWidget,
      widgetId,
    ],
  );

  return { updateNewFieldDefaultConfiguration };
};
