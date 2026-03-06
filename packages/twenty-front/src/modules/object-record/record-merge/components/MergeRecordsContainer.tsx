import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { MergeRecordsTabId } from '@/object-record/record-merge/types/MergeRecordsTabId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useMergeRecordsContainerTabs } from '@/object-record/record-merge/hooks/useMergeRecordsContainerTabs';
import { MergePreviewTab } from './MergePreviewTab';
import { MergeRecordTab } from './MergeRecordTab';
import { MergeRecordsFooter } from './MergeRecordsFooter';
import { MergeSettingsTab } from './MergeSettingsTab';

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  overflow: auto;
  width: 100%;
`;

const StyledTabListContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  overflow-y: auto;
  padding-bottom: ${themeCssVariables.spacing[16]};
`;

type MergeRecordsContainerProps = {
  objectNameSingular: string;
};

export const MergeRecordsContainer = ({
  objectNameSingular,
}: MergeRecordsContainerProps) => {
  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const { tabs } = useMergeRecordsContainerTabs(selectedRecords);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    instanceId,
  );

  return (
    <SidePanelProvider value={{ isInSidePanel: true }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
          <TabListComponentInstanceContext.Provider
            value={{ instanceId: instanceId }}
          >
            <StyledTabListContainer>
              <TabList
                tabs={tabs}
                behaveAsLinks={false}
                componentInstanceId={instanceId}
              />
            </StyledTabListContainer>
          </TabListComponentInstanceContext.Provider>
          <StyledContentContainer>
            {activeTabId === MergeRecordsTabId.MERGE_PREVIEW && (
              <MergePreviewTab objectNameSingular={objectNameSingular} />
            )}
            {activeTabId === MergeRecordsTabId.SETTINGS && <MergeSettingsTab />}
            {selectedRecords.some((record) => record.id === activeTabId) && (
              <MergeRecordTab
                objectNameSingular={objectNameSingular}
                recordId={activeTabId || ''}
              />
            )}
          </StyledContentContainer>
          <MergeRecordsFooter objectNameSingular={objectNameSingular} />
        </StyledShowPageRightContainer>
      </ShowPageContainer>
    </SidePanelProvider>
  );
};
