import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelWidgetVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  return (
    <ConditionalDisplaySettings
      surface="pageLayoutWidget"
      surfaceId={widgetInEditMode.id}
      conditionalDisplay={widgetInEditMode.conditionalDisplay}
      objectMetadataId={pageLayoutDraft.objectMetadataId}
      onConditionalDisplayChange={(conditionalDisplay) =>
        updatePageLayoutWidget(widgetInEditMode.id, { conditionalDisplay })
      }
    />
  );
};
