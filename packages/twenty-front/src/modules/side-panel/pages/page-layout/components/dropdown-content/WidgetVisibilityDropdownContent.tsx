import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { expressionToOptionId } from '@/side-panel/pages/page-layout/utils/expressionToOptionId';
import { optionIdToExpression } from '@/side-panel/pages/page-layout/utils/optionIdToExpression';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectVisibility = (optionId: string) => {
    updateCurrentWidgetConfig({
      conditionalAvailabilityExpression: optionIdToExpression(optionId),
    });
    closeDropdown();
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
