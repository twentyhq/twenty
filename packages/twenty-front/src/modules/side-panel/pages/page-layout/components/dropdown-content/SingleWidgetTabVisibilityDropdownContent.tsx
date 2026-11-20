import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { getWidgetVisibilityPropertiesFromOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityPropertiesFromOptionId';

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
    updatePageLayoutWidget(
      widgetId,
      getWidgetVisibilityPropertiesFromOptionId(optionId),
    );
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={currentOptionId}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
