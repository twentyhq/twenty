import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordIndexExportRecords } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext, useMemo } from 'react';

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

  const actionConfig = useContext(ActionConfigContext);

  const dynamicActionConfig = useMemo(() => {
    if (!actionConfig) return null;

    const originalLabel =
      typeof actionConfig.label === 'string'
        ? actionConfig.label
        : actionConfig.label?.message || 'Export';

    const originalShortLabel =
      typeof actionConfig.shortLabel === 'string'
        ? actionConfig.shortLabel
        : actionConfig.shortLabel?.message || 'Export';

    const progressText =
      progress?.exportedRecordCount !== undefined
        ? progress.displayType === 'percentage' && progress.totalRecordCount
          ? ` (${Math.round((progress.exportedRecordCount / progress.totalRecordCount) * 100)}%)`
          : ` (${progress.exportedRecordCount})`
        : '';

    return {
      ...actionConfig,
      label: `${originalLabel}${progressText}`,
      shortLabel: `${originalShortLabel}${progressText}`,
    };
  }, [actionConfig, progress]);

  if (!dynamicActionConfig) {
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
    <ActionConfigContext.Provider value={dynamicActionConfig}>
      <ActionDisplay onClick={handleClick} />
    </ActionConfigContext.Provider>
  );
};
