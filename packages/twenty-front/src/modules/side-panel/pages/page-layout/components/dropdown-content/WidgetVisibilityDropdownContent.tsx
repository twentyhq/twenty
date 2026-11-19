import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getWidgetVisibilityOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityOptionId';
import { getWidgetVisibilityUpdate } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityUpdate';

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleSelectVisibility = (optionId: string) => {
    updateCurrentWidgetConfig(getWidgetVisibilityUpdate(optionId));
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={getWidgetVisibilityOptionId(widgetInEditMode)}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
