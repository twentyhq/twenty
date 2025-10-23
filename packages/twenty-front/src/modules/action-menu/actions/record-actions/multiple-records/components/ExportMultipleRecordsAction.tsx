import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { computeProgressText } from '@/action-menu/utils/computeProgressText';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ExportMultipleRecordsAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useRecoilComponentValue(
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

  const { closeActionMenu } = useCloseActionMenu({});

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
    </ActionConfigContext.Provider>
  );
};
