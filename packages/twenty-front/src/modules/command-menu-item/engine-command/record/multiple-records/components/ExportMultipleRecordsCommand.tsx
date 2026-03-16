import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { isDefined } from 'twenty-shared/utils';

export const ExportMultipleRecordsCommand = () => {
  const { objectMetadataItem, recordIndexId } =
    useEngineCommandExecutionContext();

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to export multiple records',
    );
  }

  const { download } = useRecordIndexExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  return <HeadlessEngineCommandWrapperEffect execute={download} />;
};
