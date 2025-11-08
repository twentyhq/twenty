import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isMergeInProgressState } from '../states/mergeInProgressState';
import { mergeSettingsState } from '../states/mergeSettingsState';

type UseMergePreviewProps = {
  objectNameSingular: string;
};

export const useMergePreview = ({
  objectNameSingular,
}: UseMergePreviewProps) => {
  const [mergePreviewRecord, setMergePreviewRecord] =
    useState<ObjectRecord | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const mergeSettings = useRecoilValue(mergeSettingsState);
  const isMergeInProgress = useRecoilValue(isMergeInProgressState);

  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });

  const commandMenuNavigationMorphItemsByPage = useRecoilValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const selectedRecordIds =
    commandMenuNavigationMorphItemsByPage
      .get(CommandMenuPages.MergeRecords)
      ?.map((morphItem) => morphItem.recordId) ?? [];
  const selectedRecords = useRecoilValue(
    recordStoreRecordsSelector({
      recordIds: selectedRecordIds,
    }),
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    const fetchPreview = async () => {
      if (selectedRecords.length < 2 || isMergeInProgress || isInitialized)
        return;

      setIsGeneratingPreview(true);
      try {
        const previewRecord = await mergeManyRecords({
          recordIds: selectedRecords.map((record) => record.id),
          mergeSettings,
          preview: true,
        });
        if (!previewRecord) {
          setMergePreviewRecord(null);
          return;
        }

        const transformPreviewRecord = getRecordFromRecordNode<ObjectRecord>({
          recordNode: previewRecord,
        });

        setMergePreviewRecord(transformPreviewRecord);
        upsertRecordsInStore([transformPreviewRecord]);
      } catch {
        setMergePreviewRecord(null);
      } finally {
        setIsGeneratingPreview(false);
        setIsInitialized(true);
      }
    };

    if (selectedRecords.length > 0 && !isMergeInProgress) {
      fetchPreview();
    }
  }, [
    selectedRecords,
    mergeSettings,
    isMergeInProgress,
    mergeManyRecords,
    upsertRecordsInStore,
    isInitialized,
  ]);

  return {
    selectedRecords,
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview,
  };
};
