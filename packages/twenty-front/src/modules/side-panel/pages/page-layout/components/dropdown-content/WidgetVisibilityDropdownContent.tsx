import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { conditionalAvailabilityToOptionId } from '@/side-panel/pages/page-layout/utils/conditionalAvailabilityToOptionId';
import { optionIdToConditionalAvailability } from '@/side-panel/pages/page-layout/utils/optionIdToConditionalAvailability';

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleSelectVisibility = (optionId: string) => {
    updateCurrentWidgetConfig({
      conditionalAvailability: optionIdToConditionalAvailability(optionId),
    });
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={conditionalAvailabilityToOptionId(
        widgetInEditMode?.conditionalAvailability,
      )}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
