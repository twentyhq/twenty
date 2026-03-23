import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { computeProgressText } from '@/command-menu-item/utils/computeProgressText';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ExportRelationFieldConfigModal } from '@/object-record/record-index/export/components/ExportRelationFieldConfigModal';
import { useExportableRelationFields } from '@/object-record/record-index/export/hooks/useExportableRelationFields';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ExportMultipleRecordsCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
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

  const visibleFieldNames = finalColumns.map(
    (column) => column.metadata.fieldName,
  );

  const exportableRelationFields = useExportableRelationFields({
    objectMetadataItem,
    visibleFieldNames,
  });

  const { openModal } = useModal();
  const { closeCommandMenu } = useCloseCommandMenu({});

  const exportProgress = isDefined(progress)
    ? {
        processedRecordCount: progress.processedRecordCount,
        totalRecordCount: progress.totalRecordCount,
      }
    : undefined;

  const actionConfig = useContext(CommandConfigContext);
  const { containerType } = useContext(CommandMenuContext);

  const relationExportModalId = `${actionConfig?.key ?? 'export'}-relation-export-modal-${containerType}`;

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    relationExportModalId,
  );

  if (!isDefined(actionConfig)) {
    return null;
  }

  const originalLabel = getCommandMenuItemLabel(actionConfig.label);

  const originalShortLabel = getCommandMenuItemLabel(actionConfig.shortLabel);

  const progressText = computeProgressText(exportProgress);

  const actionConfigWithProgress = {
    ...actionConfig,
    label: `${originalLabel}${progressText}`,
    shortLabel: `${originalShortLabel}${progressText}`,
  };

  const handleClick = async () => {
    try {
      if (exportableRelationFields.length > 0) {
        openModal(relationExportModalId);
        return;
      }

      await download();
      closeCommandMenu();
    } catch (error) {
      closeCommandMenu();
      throw error;
    }
  };

  return (
    <CommandConfigContext.Provider value={actionConfigWithProgress}>
      <>
        <CommandMenuItemDisplay onClick={handleClick} />
        {isModalOpened && (
          <ExportRelationFieldConfigModal
            modalId={relationExportModalId}
            objectMetadataItem={objectMetadataItem}
            visibleFieldNames={visibleFieldNames}
            onExport={async (config) => {
              await downloadWithConfig(config);
              closeCommandMenu();
            }}
          />
        )}
      </>
    </CommandConfigContext.Provider>
  );
};
