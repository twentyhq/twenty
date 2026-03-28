import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isMergeInProgressState } from '@/object-record/record-merge/states/mergeInProgressState';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseMergePreviewProps = {
  objectNameSingular: string;
};

export const usePerformMergePreview = ({
  objectNameSingular,
}: UseMergePreviewProps) => {
  const [mergePreviewRecord, setMergePreviewRecord] =
    useState<ObjectRecord | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const isGeneratingPreviewRef = useRef(false);

  const mergeSettings = useAtomStateValue(mergeSettingsState);
  const isMergeInProgress = useAtomStateValue(isMergeInProgressState);

  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });

  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const selectedRecordIds = selectedRecords
    .map((record) => record.id)
    .sort()
    .join(',');

  const fetchPreview = useCallback(
    async (records: ObjectRecord[]) => {
      if (records.length < 2 || isGeneratingPreviewRef.current) {
        return;
      }

      isGeneratingPreviewRef.current = true;
      setIsGeneratingPreview(true);
      try {
        const previewRecord = await mergeManyRecords({
          recordIds: records.map((record) => record.id),
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
        isGeneratingPreviewRef.current = false;
        setIsGeneratingPreview(false);
      }
    },
    [mergeManyRecords, mergeSettings, upsertRecordsInStore],
  );

  useEffect(() => {
    if (
      selectedRecords.length >= 2 &&
      !isMergeInProgress &&
      !isGeneratingPreviewRef.current
    ) {
      fetchPreview(selectedRecords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecordIds, mergeSettings, isMergeInProgress, fetchPreview]);

  return {
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview,
  };
};
