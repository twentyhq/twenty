import { ConditionalAvailabilityEditor } from '@/conditional-availability/components/ConditionalAvailabilityEditor';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useVisibilitySubPageWidget } from '@/side-panel/pages/page-layout/hooks/useVisibilitySubPageWidget';
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

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <StyledContainer>
      <ConditionalAvailabilityEditor
        metadataName="pageLayoutWidget"
        itemKey={getConditionalAvailabilityEditorItemKey({
          metadataName: 'pageLayoutWidget',
          itemId: widget.id,
        })}
        node={widget.conditionalAvailability ?? null}
        onNodeChange={(conditionalAvailability) =>
          updatePageLayoutWidget(widget.id, { conditionalAvailability })
        }
      />
    </StyledContainer>
  );
};
