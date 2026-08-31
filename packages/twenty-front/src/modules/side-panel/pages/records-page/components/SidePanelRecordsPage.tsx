import { styled } from '@linaria/react';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

type SidePanelRecordsPageProps = {
  objectMetadataId: string;
  viewId: string;
};

export const SidePanelRecordsPage = ({
  objectMetadataId,
  viewId,
}: SidePanelRecordsPageProps) => {
  const sidePanelPageInstanceContext = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  );

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
            objectMetadataId={objectMetadataId}
            viewId={viewId}
            widgetId={widgetInstanceId}
          />
        </PageLayoutEditModeProviderContext>
      </PageLayoutComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
