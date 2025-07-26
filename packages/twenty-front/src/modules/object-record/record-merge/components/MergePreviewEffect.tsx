import {
  MergeManySettings,
  useMergeManyRecords,
} from '@/object-record/hooks/useMergeManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';

type MergePreviewEffectProps = {
  objectNameSingular: string;
  selectedRecords: ObjectRecord[];
  mergeSettings: MergeManySettings;
  onMergePreviewRecordChange: (record: ObjectRecord | null) => void;
  onIsGeneratingPreviewChange: (isGenerating: boolean) => void;
};

export const MergePreviewEffect = ({
  objectNameSingular,
  selectedRecords,
  mergeSettings,
  onMergePreviewRecordChange,
  onIsGeneratingPreviewChange,
}: MergePreviewEffectProps) => {
  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });
  const { upsertRecords } = useUpsertRecordsInStore();

  useEffect(() => {
    const fetchPreview = async () => {
      onIsGeneratingPreviewChange(true);
      try {
        const mergePreviewRecord = await mergeManyRecords({
          recordIds: selectedRecords.map((record) => record.id),
          mergeSettings,
          preview: true,
        });
        if (!mergePreviewRecord) return;

        onMergePreviewRecordChange(mergePreviewRecord);
        upsertRecords([mergePreviewRecord]);
      } catch (error) {
        onMergePreviewRecordChange(null);
      } finally {
        onIsGeneratingPreviewChange(false);
      }
    };

    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecords, mergeSettings]);

  return <></>;
};
