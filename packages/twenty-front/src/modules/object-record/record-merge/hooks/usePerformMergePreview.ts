import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isMergeInProgressState } from '@/object-record/record-merge/states/mergeInProgressState';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';

type UseMergePreviewProps = {
  objectNameSingular: string;
};

export const usePerformMergePreview = ({
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

  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    const fetchPreview = async () => {
      if (
        selectedRecords.length < 2 ||
        isMergeInProgress ||
        isInitialized ||
        isGeneratingPreview
      ) {
        return;
      }

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
        upsertRecordsInStore({ partialRecords: [transformPreviewRecord] });
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
    isGeneratingPreview,
    mergeManyRecords,
    upsertRecordsInStore,
    isInitialized,
  ]);

  return {
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview,
  };
};
