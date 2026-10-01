import { RecordExportConnectionEffect } from '@/record-export/components/RecordExportConnectionEffect';
import { useRecordIndexAsyncExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexAsyncExportRecords';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const ExportIndexRecordsContent = ({
  objectMetadataItem,
  recordIndexId,
  setCommandMenuItemProgress,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  setCommandMenuItemProgress: (value: number | undefined) => void;
}) => {
  const { download, progress } = useRecordIndexExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  useEffect(() => {
    if (
      isDefined(progress.totalRecordCount) &&
      isDefined(progress.processedRecordCount) &&
      progress.totalRecordCount > 0
    ) {
      const percentage = Math.round(
        (progress.processedRecordCount / progress.totalRecordCount) * 100,
      );
      setCommandMenuItemProgress(percentage);
    }
  }, [progress, setCommandMenuItemProgress]);

  return <HeadlessEngineCommandWrapperEffect execute={download} />;
};

const ExportAsyncIndexRecordsContent = ({
  objectMetadataItem,
  recordIndexId,
  onProgress,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  onProgress: (progress: number) => void;
}) => {
  const { download, cancel } = useRecordIndexAsyncExportRecords({
    objectMetadataItem,
    recordIndexId,
    onProgress,
  });
  return (
    <>
      <RecordExportConnectionEffect cancel={cancel} />
      <HeadlessEngineCommandWrapperEffect execute={download} />
    </>
  );
};

export const ExportRecordsCommand = () => {
  const isAsyncCsvExportEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
  );
  const { objectMetadataItem, recordIndexId } = useHeadlessCommandContextApi();

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

  if (!isDefined(recordIndexId)) {
    throw new Error('Record index ID is required to export records');
  }

  return (
    <ViewComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      {isAsyncCsvExportEnabled ? (
        <ExportAsyncIndexRecordsContent
          objectMetadataItem={objectMetadataItem}
          recordIndexId={recordIndexId}
          onProgress={setCommandMenuItemProgress}
        />
      ) : (
        <ExportIndexRecordsContent
          objectMetadataItem={objectMetadataItem}
          recordIndexId={recordIndexId}
          setCommandMenuItemProgress={setCommandMenuItemProgress}
        />
      )}
    </ViewComponentInstanceContext.Provider>
  );
};
