import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { viewableRecordIndexObjectMetadataIdComponentState } from '@/side-panel/pages/record-index-page/states/viewableRecordIndexObjectMetadataIdComponentState';
import { viewableRecordIndexViewIdComponentState } from '@/side-panel/pages/record-index-page/states/viewableRecordIndexViewIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const SidePanelRecordIndexPage = () => {
  const viewableRecordIndexObjectMetadataId = useAtomComponentStateValue(
    viewableRecordIndexObjectMetadataIdComponentState,
  );
  const viewableRecordIndexViewId = useAtomComponentStateValue(
    viewableRecordIndexViewIdComponentState,
  );
  const sidePanelPageInstanceContext = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  );

  if (!isDefined(viewableRecordIndexObjectMetadataId)) {
    throw new Error('Object metadata id is not defined');
  }

  if (!isDefined(viewableRecordIndexViewId)) {
    throw new Error('View id is not defined');
  }

  return (
    <StyledContainer>
      {/* The widget machinery is shared with dashboards, whose page provides
          the page layout scope and edit mode context; the side panel hosts a
          synthetic layout scope and is never in edit mode. */}
      <PageLayoutComponentInstanceContext.Provider
        value={{
          instanceId: `side-panel-record-index-${sidePanelPageInstanceContext?.instanceId}`,
        }}
      >
        <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
          <RecordTableWidgetRendererContent
            objectMetadataId={viewableRecordIndexObjectMetadataId}
            viewId={viewableRecordIndexViewId}
            widgetId={`side-panel-record-index-${sidePanelPageInstanceContext?.instanceId}`}
          />
        </PageLayoutEditModeProviderContext>
      </PageLayoutComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
