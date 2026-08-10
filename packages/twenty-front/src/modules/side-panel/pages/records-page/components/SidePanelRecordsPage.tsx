import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { viewableRecordsObjectMetadataIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsObjectMetadataIdComponentState';
import { viewableRecordsViewIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsViewIdComponentState';
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

export const SidePanelRecordsPage = () => {
  const viewableRecordsObjectMetadataId = useAtomComponentStateValue(
    viewableRecordsObjectMetadataIdComponentState,
  );
  const viewableRecordsViewId = useAtomComponentStateValue(
    viewableRecordsViewIdComponentState,
  );
  const sidePanelPageInstanceContext = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  );

  if (!isDefined(viewableRecordsObjectMetadataId)) {
    throw new Error('Object metadata id is not defined');
  }

  if (!isDefined(viewableRecordsViewId)) {
    throw new Error('View id is not defined');
  }

  const widgetInstanceId = `side-panel-records-${sidePanelPageInstanceContext?.instanceId}`;

  return (
    <StyledContainer>
      {/* The widget machinery is shared with dashboards, whose page provides
          the page layout scope and edit mode context; the side panel hosts a
          synthetic layout scope and is never in edit mode. */}
      <PageLayoutComponentInstanceContext.Provider
        value={{ instanceId: widgetInstanceId }}
      >
        <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
          <RecordTableWidgetRendererContent
            objectMetadataId={viewableRecordsObjectMetadataId}
            viewId={viewableRecordsViewId}
            widgetId={widgetInstanceId}
          />
        </PageLayoutEditModeProviderContext>
      </PageLayoutComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
