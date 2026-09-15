import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { useExportSingleRecord } from '@/object-record/record-show/hooks/useExportSingleRecord';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

const ExportIndexRecordsContent = ({
  objectMetadataItem,
  recordIndexId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
}) => {
  const { download } = useRecordIndexExportRecords({
    objectMetadataItem,
    recordIndexId,
  });

  return <HeadlessEngineCommandWrapperEffect execute={download} />;
};

const ExportShowRecordContent = ({
  objectMetadataItem,
  recordId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
}) => {
  const filename = `${objectMetadataItem.nameSingular}.csv`;
  const { download } = useExportSingleRecord({
    filename,
    objectMetadataItem,
    recordId,
  });

  return <HeadlessEngineCommandWrapperEffect execute={download} />;
};

export const ExportRecordsCommand = () => {
  const { objectMetadataItem, recordIndexId, selectedRecords } =
    useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata item is required to export records');
  }

  const recordId = selectedRecords[0]?.id;
  const isShowPageExport = !isDefined(recordIndexId) && isDefined(recordId);

  if (isShowPageExport) {
    return (
      <ExportShowRecordContent
        objectMetadataItem={objectMetadataItem}
        recordId={recordId}
      />
    );
  }

  if (!isDefined(recordIndexId)) {
    throw new Error(
      'Record index ID is required to export records from index page',
    );
  }

  return (
    <ViewComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <ExportIndexRecordsContent
        objectMetadataItem={objectMetadataItem}
        recordIndexId={recordIndexId}
      />
    </ViewComponentInstanceContext.Provider>
  );
};
