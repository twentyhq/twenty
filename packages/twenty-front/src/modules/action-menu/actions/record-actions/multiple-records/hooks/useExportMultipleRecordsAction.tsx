import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconDatabaseExport } from 'twenty-ui';

import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';

export const useExportMultipleRecordsAction = ({
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

  const registerExportMultipleRecordsAction = ({
    position,
  }: {
    position: number;
  }) => {
    addActionMenuEntry({
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
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
