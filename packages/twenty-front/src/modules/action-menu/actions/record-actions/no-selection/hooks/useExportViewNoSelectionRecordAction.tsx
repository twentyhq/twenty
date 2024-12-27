import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconDatabaseExport } from 'twenty-ui';

import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';

export const useExportViewNoSelectionRecordAction = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { progress, download } = useExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId: objectMetadataItem.namePlural,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  const registerExportViewNoSelectionRecordsAction = ({
    position,
  }: {
    position: number;
  }) => {
    addActionMenuEntry({
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.Global,
      key: NoSelectionRecordActionKeys.EXPORT_VIEW,
      position,
      label: displayedExportProgress(progress),
      Icon: IconDatabaseExport,
      accent: 'default',
      onClick: () => download(),
    });
  };

  const unregisterExportViewNoSelectionRecordsAction = () => {
    removeActionMenuEntry('export-view-no-selection');
  };

  return {
    registerExportViewNoSelectionRecordsAction,
    unregisterExportViewNoSelectionRecordsAction,
  };
};
