import { t } from '@lingui/core/macro';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useMergeRecordsContainerTabs } from '@/object-record/record-merge/hooks/useMergeRecordsContainerTabs';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { MergeRecordsTabId } from '@/object-record/record-merge/types/MergeRecordsTabId';
import { MergeRecordsContentScrollResetEffect } from '@/object-record/record-merge/components/MergeRecordsContentScrollResetEffect';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
  padding-inline-start: ${themeCssVariables.spacing[2]};
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  overflow-y: auto;
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

  const contentContainerRef = useRef<HTMLDivElement>(null);

  return (
    <SidePanelProvider value={{ isInSidePanel: true }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
          <TabListRoot componentInstanceId={instanceId}>
            <StyledTabListContainer>
              <TabList
                aria-label={t`Merge records`}
                tabs={tabs}
                behaveAsLinks={false}
                componentInstanceId={instanceId}
              />
            </StyledTabListContainer>
            <MergeRecordsContentScrollResetEffect
              activeTabId={activeTabId}
              contentContainerRef={contentContainerRef}
            />
            <Tabs.Panel
              value={activeTabId ?? ''}
              render={<StyledContentContainer ref={contentContainerRef} />}
            >
              {activeTabId === MergeRecordsTabId.MERGE_PREVIEW && (
                <MergePreviewTab objectNameSingular={objectNameSingular} />
              )}
              {activeTabId === MergeRecordsTabId.SETTINGS && (
                <MergeSettingsTab />
              )}
              {selectedRecords.some((record) => record.id === activeTabId) && (
                <MergeRecordTab
                  objectNameSingular={objectNameSingular}
                  recordId={activeTabId || ''}
                />
              )}
            </Tabs.Panel>
          </TabListRoot>
          <MergeRecordsFooter objectNameSingular={objectNameSingular} />
        </StyledShowPageRightContainer>
      </ShowPageContainer>
    </SidePanelProvider>
  );
};
