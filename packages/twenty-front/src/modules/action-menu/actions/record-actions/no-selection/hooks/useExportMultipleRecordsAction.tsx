import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconDatabaseExport } from 'twenty-ui';

import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';

export const useExportViewNoSelectionRecordAction = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { progress, download } = useExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId: objectMetadataItem.namePlural,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  const registerExportViewNoSelectionRecordsAction = () => {
    addActionMenuEntry({
      type: 'standard',
      scope: 'record-selection',
      key: 'export-view-no-selection',
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
