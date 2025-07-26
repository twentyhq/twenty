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
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect, useState } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useMergeRecordsContainerTabs } from '../hooks/useMergeRecordsContainerTabs';
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

const StyledContentContainer = styled.div<{ isInRightDrawer: boolean }>`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.background.primary};
  padding-bottom: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.spacing(16) : 0};
`;

type MergeRecordsContainerProps = {
  componentInstanceId: string;
  objectNameSingular: string;
  selectedRecords: ObjectRecord[];
  loading?: boolean;
  isInRightDrawer?: boolean;
};

export const MergeRecordsContainer = ({
  componentInstanceId,
  objectNameSingular,
  selectedRecords,
  loading = false,
  isInRightDrawer = false,
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
  const { upsertRecords } = useUpsertRecordsInStore();

  const navigate = useNavigateApp();

  const { t } = useLingui();
  const { tabs } = useMergeRecordsContainerTabs(selectedRecords, loading);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    const fetchPreview = async () => {
      setIsGeneratingPreview(true);
      try {
        const mergePreviewRecord = await mergeManyRecords({
          recordIds: selectedRecords.map((record) => record.id),
          mergeSettings,
          preview: true,
        });
        if (!mergePreviewRecord) return;

        setMergePreviewRecord(mergePreviewRecord);
        upsertRecords([mergePreviewRecord]);
      } catch (error) {
        setMergePreviewRecord(null);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecords, mergeSettings]);

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

  const renderTabContent = () => {
    if (activeTabId === MergeRecordsTabId.MERGE_PREVIEW) {
      return (
        <MergePreviewTab
          objectNameSingular={objectNameSingular}
          mergedPreviewRecord={mergePreviewRecord}
          isGeneratingPreview={isGeneratingPreview}
          isInRightDrawer={isInRightDrawer}
        />
      );
    }

    if (activeTabId === MergeRecordsTabId.SETTINGS) {
      return (
        <MergeSettingsTab
          selectedRecords={selectedRecords}
          mergeSettings={mergeSettings}
          onMergeSettingsChange={setMergeSettings}
          isInRightDrawer={isInRightDrawer}
        />
      );
    }

    const recordIndex = selectedRecords.findIndex(
      (record) => record.id === activeTabId,
    );
    if (recordIndex !== -1) {
      return (
        <MergeRecordTab
          objectNameSingular={objectNameSingular}
          recordId={activeTabId || ''}
          isInRightDrawer={isInRightDrawer}
        />
      );
    }

    return null;
  };

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
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
          <StyledContentContainer isInRightDrawer={isInRightDrawer}>
            {renderTabContent()}
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
