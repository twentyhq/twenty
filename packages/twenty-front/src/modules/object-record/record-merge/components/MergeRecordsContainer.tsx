import styled from '@emotion/styled';

import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useMergeRecordsSettings } from '@/object-record/record-merge/hooks/useMergeRecordsSettings';
import { MergeRecordsTabId } from '@/object-record/record-merge/types/MergeRecordsTabId';
import { useMergeRecordsContainerTabs } from '../hooks/useMergeRecordsContainerTabs';
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
  componentInstanceId: string;
  objectNameSingular: string;
};

export const MergeRecordsContainer = ({
  componentInstanceId,
  objectNameSingular,
}: MergeRecordsContainerProps) => {
  const { selectedRecords } = useMergeRecordsSettings();

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const { tabs } = useMergeRecordsContainerTabs(selectedRecords);

  return (
    <RightDrawerProvider value={{ isInRightDrawer: true }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
          <TabListComponentInstanceContext.Provider
            value={{ instanceId: componentInstanceId }}
          >
            <StyledTabList
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={componentInstanceId}
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
