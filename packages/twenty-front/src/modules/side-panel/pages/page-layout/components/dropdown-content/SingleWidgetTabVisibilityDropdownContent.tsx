import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { optionIdToConditionalAvailability } from '@/side-panel/pages/page-layout/utils/optionIdToConditionalAvailability';

type SingleWidgetTabVisibilityDropdownContentProps = {
  widgetId: string;
  currentOptionId: string;
  pageLayoutId: string;
};

export const SingleWidgetTabVisibilityDropdownContent = ({
  widgetId,
  currentOptionId,
  pageLayoutId,
}: SingleWidgetTabVisibilityDropdownContentProps) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const handleSelectVisibility = (optionId: string) => {
    updatePageLayoutWidget(widgetId, {
      conditionalAvailability: optionIdToConditionalAvailability(optionId),
    });
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={currentOptionId}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
