import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { computeProgressText } from '@/command-menu-item/utils/computeProgressText';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
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

  const { download, progress } = useRecordIndexExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId: getRecordIndexIdFromObjectNamePluralAndViewId(
      objectMetadataItem.namePlural,
      contextStoreCurrentViewId,
    ),
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  const { closeCommandMenu } = useCloseCommandMenu({});

  const exportProgress = isDefined(progress)
    ? {
        processedRecordCount: progress.processedRecordCount,
        totalRecordCount: progress.totalRecordCount,
      }
    : undefined;

  const actionConfig = useContext(CommandConfigContext);

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
      await download();
      closeCommandMenu();
    } catch (error) {
      closeCommandMenu();
      throw error;
    }
  };

  return (
    <CommandConfigContext.Provider value={actionConfigWithProgress}>
      <CommandMenuItemDisplay onClick={handleClick} />
    </CommandConfigContext.Provider>
  );
};
