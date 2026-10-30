import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { expressionToOptionId } from '@/side-panel/pages/page-layout/utils/expressionToOptionId';
import { optionIdToExpression } from '@/side-panel/pages/page-layout/utils/optionIdToExpression';

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleSelectVisibility = (optionId: string) => {
    updateCurrentWidgetConfig({
      conditionalAvailabilityExpression: optionIdToExpression(optionId),
    });
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={expressionToOptionId(
        widgetInEditMode?.conditionalAvailabilityExpression,
      )}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
