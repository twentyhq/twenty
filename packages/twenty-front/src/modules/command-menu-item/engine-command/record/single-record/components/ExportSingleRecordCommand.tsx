import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useExportSingleRecord } from '@/object-record/record-show/hooks/useExportSingleRecord';
import { isDefined } from 'twenty-shared/utils';

export const ExportSingleRecordCommand = () => {
  const { objectMetadataItem, currentViewId, selectedRecords } =
    useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

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
