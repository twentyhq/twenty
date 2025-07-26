import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { MergeRecordsTabId } from '@/object-record/record-merge/types/MergeRecordsTabId';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useState } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useMergeRecordsContainerTabs } from '../hooks/useMergeRecordsContainerTabs';
import { MergePreviewEffect } from './MergePreviewEffect';
import { MergePreviewTab } from './MergePreviewTab';
import { MergeRecordsFooter } from './MergeRecordsFooter';
import { MergeRecordTab } from './MergeRecordTab';
import { MergeSettingsTab } from './MergeSettingsTab';

import { AppPath } from '@/types/AppPath';
import { useLingui } from '@lingui/react/macro';

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
  selectedRecords: ObjectRecord[];
  loading?: boolean;
};

export const MergeRecordsContainer = ({
  componentInstanceId,
  objectNameSingular,
  selectedRecords,
  loading = false,
}: MergeRecordsContainerProps) => {
  const mergeSettings = useRecoilValue(mergeSettingsState);
  const setMergeSettings = useSetRecoilState(mergeSettingsState);

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const [mergePreviewRecord, setMergePreviewRecord] =
    useState<ObjectRecord | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const { mergeManyRecords, loading: isMerging } = useMergeManyRecords({
    objectNameSingular,
  });

  const navigate = useNavigateApp();

  const { t } = useLingui();
  const { tabs } = useMergeRecordsContainerTabs(selectedRecords, loading);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const handleMergeRecords = async () => {
    try {
      const mergedRecord = await mergeManyRecords({
        recordIds: selectedRecords.map((record) => record.id),
        mergeSettings,
        preview: false,
      });

      if (!mergedRecord) {
        throw new Error('Failed to merge records');
      }
      const recordCount = selectedRecords.length;

      enqueueSuccessSnackBar({
        message: t`Successfully merged ${recordCount} records`,
      });

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: objectNameSingular,
        objectRecordId: mergedRecord.id,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to merge records. Please try again.',
      });
    }
  };

  return (
    <RightDrawerProvider value={{ isInRightDrawer: true }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
          <MergePreviewEffect
            objectNameSingular={objectNameSingular}
            selectedRecords={selectedRecords}
            mergeSettings={mergeSettings}
            onMergePreviewRecordChange={setMergePreviewRecord}
            onIsGeneratingPreviewChange={setIsGeneratingPreview}
          />
          <TabListComponentInstanceContext.Provider
            value={{ instanceId: componentInstanceId }}
          >
            <StyledTabList
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={componentInstanceId}
              loading={loading}
            />
          </TabListComponentInstanceContext.Provider>
          <StyledContentContainer>
            {activeTabId === MergeRecordsTabId.MERGE_PREVIEW && (
              <MergePreviewTab
                objectNameSingular={objectNameSingular}
                mergedPreviewRecord={mergePreviewRecord}
                isGeneratingPreview={isGeneratingPreview}
              />
            )}
            {activeTabId === MergeRecordsTabId.SETTINGS && (
              <MergeSettingsTab
                selectedRecords={selectedRecords}
                mergeSettings={mergeSettings}
                onMergeSettingsChange={setMergeSettings}
              />
            )}
            {selectedRecords.some((record) => record.id === activeTabId) && (
              <MergeRecordTab
                objectNameSingular={objectNameSingular}
                recordId={activeTabId || ''}
              />
            )}
          </StyledContentContainer>
          <MergeRecordsFooter
            onMerge={handleMergeRecords}
            isMerging={isMerging}
          />
        </StyledShowPageRightContainer>
      </ShowPageContainer>
    </RightDrawerProvider>
  );
};
