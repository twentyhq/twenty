import { WidgetVisibilitySettings } from '@/side-panel/pages/page-layout/components/WidgetVisibilitySettings';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelWidgetVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  return (
    <WidgetVisibilitySettings
      pageLayoutId={pageLayoutId}
      widget={widgetInEditMode}
    />
  );
};
