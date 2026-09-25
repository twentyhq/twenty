import { RecordExportConnectionEffect } from '@/record-export/components/RecordExportConnectionEffect';
import { useRecordIndexAsyncExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexAsyncExportRecords';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useExportSingleRecord } from '@/object-record/record-show/hooks/useExportSingleRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';
import { useCallback, useState } from 'react';

const ExportIndexRecordsContent = ({
  objectMetadataItem,
  recordIndexId,
  onProgress,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  onProgress: (progress: number) => void;
}) => {
  const [abortController] = useState(() => new AbortController());
  const { download: downloadAsync, cancel: cancelAsync } =
    useRecordIndexAsyncExportRecords({
      objectMetadataItem,
      recordIndexId,
      onProgress,
    });
  const { download } = useRecordIndexExportRecords({
    objectMetadataItem,
    recordIndexId,
    filename: `${objectMetadataItem.nameSingular}.csv`,
    delayMs: 0,
    onMoreRecords: downloadAsync,
    abortSignal: abortController.signal,
  });
  const cancel = useCallback(() => {
    abortController.abort();
    cancelAsync();
  }, [abortController, cancelAsync]);

  return (
    <>
      <RecordExportConnectionEffect cancel={cancel} />
      <HeadlessEngineCommandWrapperEffect execute={download} />
    </>
  );
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

  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const setCommandMenuItemProgress = useSetAtomFamilyState(
    commandMenuItemProgressFamilyState,
    engineCommandId,
  );

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
        onProgress={setCommandMenuItemProgress}
      />
    </ViewComponentInstanceContext.Provider>
  );
};
