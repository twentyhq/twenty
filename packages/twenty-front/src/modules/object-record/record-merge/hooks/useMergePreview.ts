import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useMergeRecordRelationships } from '@/object-record/record-merge/hooks/useMergeRecordRelationships';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
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

  const mergeSettings = useRecoilValue(mergeSettingsState);
  const { records: selectedRecords } = useFindManyRecordsSelectedInContextStore(
    {
      limit: 10,
    },
  );

  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });
  const { upsertRecords } = useUpsertRecordsInStore();

  const { isLoading: isLoadingRelationships } = useMergeRecordRelationships({
    objectNameSingular,
    previewRecordId: mergePreviewRecord?.id || '',
    selectedRecords: selectedRecords,
  });

  useEffect(() => {
    const fetchPreview = async () => {
      if (selectedRecords.length < 2) return;
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

        setMergePreviewRecord(previewRecord);
        upsertRecords([previewRecord]);
      } catch (error) {
        setMergePreviewRecord(null);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    if (selectedRecords.length > 0) {
      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecords, mergeSettings]);

  return {
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview || isLoadingRelationships,
  };
};
