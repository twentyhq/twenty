import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useActionWithProgress } from '@/action-menu/hooks/useActionWithProgress';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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

  const { actionConfigWithProgress } = useActionWithProgress(exportProgress);

  if (!actionConfigWithProgress) {
    return null;
  }

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
