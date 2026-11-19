import { ConditionalAvailabilityEditor } from '@/conditional-availability/components/ConditionalAvailabilityEditor';
import { ConditionalAvailabilityEditorPage } from '@/conditional-availability/components/ConditionalAvailabilityEditorPage';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useVisibilitySubPageWidget } from '@/side-panel/pages/page-layout/hooks/useVisibilitySubPageWidget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelWidgetVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const widget = useVisibilitySubPageWidget(pageLayoutId);
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <ConditionalAvailabilityEditorPage
      objectMetadataId={pageLayoutDraft.objectMetadataId}
    >
      {(objectMetadataItem) => (
        <ConditionalAvailabilityEditor
          metadataName="pageLayoutWidget"
          itemKey={getConditionalAvailabilityEditorItemKey({
            metadataName: 'pageLayoutWidget',
            itemId: widget.id,
          })}
          node={widget.conditionalAvailability ?? null}
          objectMetadataItem={objectMetadataItem}
          onNodeChange={(conditionalAvailability) =>
            updatePageLayoutWidget(widget.id, { conditionalAvailability })
          }
        />
      )}
    </ConditionalAvailabilityEditorPage>
  );
};
