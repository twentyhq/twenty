import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { getWidgetVisibilityUpdate } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityUpdate';

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
    updatePageLayoutWidget(widgetId, getWidgetVisibilityUpdate(optionId));
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={currentOptionId}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
