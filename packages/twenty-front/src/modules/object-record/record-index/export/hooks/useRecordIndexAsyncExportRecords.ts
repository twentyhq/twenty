import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordIndexExportParameters } from '@/object-record/record-index/export/hooks/useRecordIndexExportParameters';
import { createRecordExportConnection } from '@/record-export/utils/createRecordExportConnection';
import { useState } from 'react';
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
  const [connection] = useState(createRecordExportConnection);
  return {
    download: () => connection.exportRecords({ input: parameters, onProgress }),
    cancel: connection.cancel,
  };
};
