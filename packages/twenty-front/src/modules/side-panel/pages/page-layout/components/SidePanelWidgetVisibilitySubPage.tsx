import { ConditionalAvailabilityEditor } from '@/conditional-availability/components/ConditionalAvailabilityEditor';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useVisibilitySubPageWidget } from '@/side-panel/pages/page-layout/hooks/useVisibilitySubPageWidget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

export const SidePanelWidgetVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const widget = useVisibilitySubPageWidget(pageLayoutId);
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  if (!isDefined(widget)) {
    return null;
  }

  const objectMetadataItem =
    objectMetadataItems.find(
      (candidate) => candidate.id === pageLayoutDraft.objectMetadataId,
    ) ?? null;

  return (
    <StyledContainer>
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
    </StyledContainer>
  );
};
