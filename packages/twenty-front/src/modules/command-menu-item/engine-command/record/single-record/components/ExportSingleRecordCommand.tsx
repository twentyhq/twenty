import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useExportSingleRecord } from '@/object-record/record-show/hooks/useExportSingleRecord';
import { isDefined } from 'twenty-shared/utils';

export const ExportSingleRecordCommand = () => {
  const { objectMetadataItem, currentViewId, recordId } =
    useEngineCommandExecutionContext();

  if (
    !isDefined(currentViewId) ||
    !isDefined(recordId) ||
    !isDefined(objectMetadataItem)
  ) {
    throw new Error(
      'Current view ID, record ID, and object metadata are required to export single record',
    );
  }

  const filename = `${objectMetadataItem.nameSingular}.csv`;
  const { download } = useExportSingleRecord({
    filename,
    objectMetadataItem,
    recordId,
  });

  return <HeadlessEngineCommandWrapperEffect execute={download} />;
};
