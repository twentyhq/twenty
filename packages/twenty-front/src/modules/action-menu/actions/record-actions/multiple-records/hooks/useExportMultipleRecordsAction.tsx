import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconDatabaseExport } from 'twenty-ui';

import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';
import { useContext } from 'react';

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

  const { onActionStartedCallback, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const registerExportMultipleRecordsAction = ({
    position,
  }: {
    position: number;
  }) => {
    addActionMenuEntry({
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      key: MultipleRecordsActionKeys.EXPORT,
      position,
      label: displayedExportProgress(progress),
      shortLabel: 'Export',
      Icon: IconDatabaseExport,
      accent: 'default',
      onClick: async () => {
        await onActionStartedCallback?.({
          key: MultipleRecordsActionKeys.EXPORT,
        });
        await download();
        await onActionExecutedCallback?.({
          key: MultipleRecordsActionKeys.EXPORT,
        });
      },
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
