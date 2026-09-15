import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordIndexExportParameters } from '@/object-record/record-index/export/hooks/useRecordIndexExportParameters';
import { useExportRecords } from '@/record-export/hooks/useExportRecords';
import { type ViewType } from '@/views/types/ViewType';

export const useRecordIndexAsyncExportRecords = ({
  objectMetadataItem,
  recordIndexId,
  viewType,
  onProgress,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  viewType?: ViewType;
  onProgress?: (progress: number) => void;
}) => {
  const parameters = useRecordIndexExportParameters({
    objectMetadataItem,
    recordIndexId,
    viewType,
  });
  const { exportRecords } = useExportRecords({ onProgress });
  return { download: () => exportRecords(parameters) };
};
