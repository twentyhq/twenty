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
  onPreviewChange: (record: ObjectRecord | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
};

export const MergePreviewEffect = ({
  objectNameSingular,
  selectedRecords,
  mergeSettings,
  onPreviewChange,
  onLoadingChange,
}: MergePreviewEffectProps) => {
  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });
  const { upsertRecords } = useUpsertRecordsInStore();

  useEffect(() => {
    const fetchPreview = async () => {
      onLoadingChange(true);
      try {
        const mergePreviewRecord = await mergeManyRecords({
          recordIds: selectedRecords.map((record) => record.id),
          mergeSettings,
          preview: true,
        });
        if (!mergePreviewRecord) return;

        onPreviewChange(mergePreviewRecord);
        upsertRecords([mergePreviewRecord]);
      } catch (error) {
        onPreviewChange(null);
      } finally {
        onLoadingChange(false);
      }
    };

    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecords, mergeSettings]);

  return <></>;
};
