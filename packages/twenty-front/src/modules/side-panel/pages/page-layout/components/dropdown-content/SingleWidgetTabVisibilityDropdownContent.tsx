import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { expressionToOptionId } from '@/side-panel/pages/page-layout/utils/expressionToOptionId';
import { optionIdToExpression } from '@/side-panel/pages/page-layout/utils/optionIdToExpression';

type SingleWidgetTabVisibilityDropdownContentProps = {
  widgetId: string;
  currentExpression: string | null | undefined;
  pageLayoutId: string;
};

export const SingleWidgetTabVisibilityDropdownContent = ({
  widgetId,
  currentExpression,
  pageLayoutId,
}: SingleWidgetTabVisibilityDropdownContentProps) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const handleSelectVisibility = (optionId: string) => {
    updatePageLayoutWidget(widgetId, {
      conditionalAvailabilityExpression: optionIdToExpression(optionId),
    });
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={expressionToOptionId(currentExpression)}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
