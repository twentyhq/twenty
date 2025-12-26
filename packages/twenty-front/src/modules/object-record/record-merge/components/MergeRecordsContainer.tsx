import styled from '@emotion/styled';

import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
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
  justify-content: start;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.background.primary};
  padding-bottom: ${({ theme }) => theme.spacing(16)};
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
    CommandMenuPageComponentInstanceContext,
  );
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    instanceId,
  );

  return (
    <RightDrawerProvider value={{ isInRightDrawer: true }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
          <TabListComponentInstanceContext.Provider
            value={{ instanceId: instanceId }}
          >
            <StyledTabList
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={instanceId}
            />
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
    </RightDrawerProvider>
  );
};
