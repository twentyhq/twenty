import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { computeProgressText } from '@/action-menu/utils/computeProgressText';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ExportRelationFieldConfigModal } from '@/object-record/record-index/export/components/ExportRelationFieldConfigModal';
import { useExportableRelationFields } from '@/object-record/record-index/export/hooks/useExportableRelationFields';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { type ExportConfig } from '@/object-record/record-index/export/types/ExportConfig';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useCallback, useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

const EXPORT_CONFIG_MODAL_ID = 'export-relation-field-config-modal';

export const ExportMultipleRecordsAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { download, downloadWithConfig, progress, finalColumns } =
    useRecordIndexExportRecords({
      delayMs: 100,
      objectMetadataItem,
      recordIndexId: getRecordIndexIdFromObjectNamePluralAndViewId(
        objectMetadataItem.namePlural,
        contextStoreCurrentViewId,
      ),
      filename: `${objectMetadataItem.nameSingular}.csv`,
    });

  const visibleFieldNames = useMemo(
    () => finalColumns.map((col) => col.metadata.fieldName),
    [finalColumns],
  );

  const exportableRelationFields = useExportableRelationFields({
    objectMetadataItem,
    visibleFieldNames,
  });

  const { openModal } = useModal();
  const { closeActionMenu } = useCloseActionMenu({});

  const handleConfiguredExport = useCallback(
    async (config: ExportConfig) => {
      try {
        await downloadWithConfig(config);
        closeActionMenu();
      } catch (error) {
        closeActionMenu();
        throw error;
      }
    },
    [downloadWithConfig, closeActionMenu],
  );

  const exportProgress = progress
    ? {
        processedRecordCount: progress.processedRecordCount,
        totalRecordCount: progress.totalRecordCount,
      }
    : undefined;

  const actionConfig = useContext(ActionConfigContext);

  if (!isDefined(actionConfig)) {
    return null;
  }

  const originalLabel = getActionLabel(actionConfig.label);

  const originalShortLabel = getActionLabel(actionConfig.shortLabel ?? '');

  const progressText = computeProgressText(exportProgress);

  const actionConfigWithProgress = {
    ...actionConfig,
    label: `${originalLabel}${progressText}`,
    shortLabel: `${originalShortLabel}${progressText}`,
  };

  const handleClick = async () => {
    if (exportableRelationFields.length > 0) {
      openModal(EXPORT_CONFIG_MODAL_ID);
      return;
    }

    try {
      await download();
      closeActionMenu();
    } catch (error) {
      closeActionMenu();
      throw error;
    }
  };

  return (
    <ActionConfigContext.Provider value={actionConfigWithProgress}>
      <ActionDisplay onClick={handleClick} />
      <ExportRelationFieldConfigModal
        modalId={EXPORT_CONFIG_MODAL_ID}
        objectMetadataItem={objectMetadataItem}
        visibleFieldNames={visibleFieldNames}
        onExport={handleConfiguredExport}
      />
    </ActionConfigContext.Provider>
  );
};
