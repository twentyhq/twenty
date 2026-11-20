import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getWidgetVisibilityOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityOptionId';
import { getWidgetVisibilityPropertiesFromOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityPropertiesFromOptionId';
import { isDefined } from 'twenty-shared/utils';

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const handleSelectVisibility = (optionId: string) => {
    if (!isDefined(widgetInEditMode)) {
      return;
    }

    updatePageLayoutWidget(
      widgetInEditMode.id,
      getWidgetVisibilityPropertiesFromOptionId(optionId),
    );
  };

  return (
    <WidgetVisibilityOptionsList
      currentOptionId={getWidgetVisibilityOptionId(widgetInEditMode)}
      onSelectVisibility={handleSelectVisibility}
    />
  );
};
