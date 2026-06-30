import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { isMergeInProgressState } from '@/object-record/record-merge/states/mergeInProgressState';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ErrorLike } from '@apollo/client';
import { useEffect, useState } from 'react';

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

  const mergeSettings = useAtomStateValue(mergeSettingsState);
  const isMergeInProgress = useAtomStateValue(isMergeInProgressState);

  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });

  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { enqueueErrorSnackBar } = useSnackBar();

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
      } catch (error) {
        setMergePreviewRecord(null);
        enqueueErrorSnackBar({
          apolloError: error as ErrorLike,
        });
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
    enqueueErrorSnackBar,
  ]);

  return {
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview,
  };
};
