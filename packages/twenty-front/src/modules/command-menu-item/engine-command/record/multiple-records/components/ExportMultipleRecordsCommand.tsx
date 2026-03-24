import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ExportRelationFieldConfigModal } from '@/object-record/record-index/export/components/ExportRelationFieldConfigModal';
import { useExportableRelationFields } from '@/object-record/record-index/export/hooks/useExportableRelationFields';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { type ExportConfig } from '@/object-record/record-index/export/types/ExportConfig';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const ExportMultipleRecordsCommandContent = ({
  objectMetadataItem,
  recordIndexId,
  setCommandMenuItemProgress,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  setCommandMenuItemProgress: (value: number | undefined) => void;
}) => {
  const { download, downloadWithConfig, progress, finalColumns } =
    useRecordIndexExportRecords({
      delayMs: 100,
      objectMetadataItem,
      recordIndexId,
      filename: `${objectMetadataItem.nameSingular}.csv`,
    });

  const visibleFieldNames = finalColumns.map(
    (column) => column.metadata.fieldName,
  );

  const exportableRelationFields = useExportableRelationFields({
    objectMetadataItem,
    visibleFieldNames,
  });

  const hasRelationFields = exportableRelationFields.length > 0;

  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );

  const unmountEngineCommand = useUnmountEngineCommand();
  const { openModal } = useModal();
  const { isInitializedRef, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();

  const relationExportModalId = `${engineCommandId}-relation-export-modal`;

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

  // Open the relation config modal on mount when relation fields exist
  useEffect(() => {
    if (!hasRelationFields || isInitializedRef.current) {
      return;
    }

    setIsInitialized(true);
    openModal(relationExportModalId);
  }, [
    hasRelationFields,
    isInitializedRef,
    setIsInitialized,
    openModal,
    relationExportModalId,
  ]);

  const handleModalExport = useCallback(
    async (config: ExportConfig) => {
      await downloadWithConfig(config);
      unmountEngineCommand(engineCommandId);
    },
    [downloadWithConfig, unmountEngineCommand, engineCommandId],
  );

  if (hasRelationFields) {
    return (
      <ExportRelationFieldConfigModal
        modalId={relationExportModalId}
        objectMetadataItem={objectMetadataItem}
        visibleFieldNames={visibleFieldNames}
        onExport={handleModalExport}
      />
    );
  }

  return <HeadlessEngineCommandWrapperEffect execute={download} />;
};

export const ExportMultipleRecordsCommand = () => {
  const { objectMetadataItem, recordIndexId } =
    useMountedEngineCommandContext();

  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );

  const setCommandMenuItemProgress = useSetAtomFamilyState(
    commandMenuItemProgressFamilyState,
    engineCommandId,
  );

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to export multiple records',
    );
  }

  return (
    <ViewComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <ExportMultipleRecordsCommandContent
        objectMetadataItem={objectMetadataItem}
        recordIndexId={recordIndexId}
        setCommandMenuItemProgress={setCommandMenuItemProgress}
      />
    </ViewComponentInstanceContext.Provider>
  );
};
