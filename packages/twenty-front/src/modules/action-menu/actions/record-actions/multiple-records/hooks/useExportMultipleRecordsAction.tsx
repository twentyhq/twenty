import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconDatabaseExport } from 'twenty-ui';

import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';

export const useExportMultipleRecordsAction = ({
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

  const registerExportMultipleRecordsAction = () => {
    addActionMenuEntry({
      type: 'standard',
      scope: 'record-selection',
      key: 'export-multiple-records',
      position,
      label: displayedExportProgress(progress),
      Icon: IconDatabaseExport,
      accent: 'default',
      onClick: () => download(),
    });
  };

  const unregisterExportMultipleRecordsAction = () => {
    removeActionMenuEntry('export-multiple-records');
  };

  return {
    registerExportMultipleRecordsAction,
    unregisterExportMultipleRecordsAction,
  };
};
