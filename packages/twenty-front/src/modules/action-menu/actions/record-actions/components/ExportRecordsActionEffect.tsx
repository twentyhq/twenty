import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { IconDatabaseExport } from 'twenty-ui';

import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  displayedExportProgress,
  useExportRecords,
} from '@/object-record/record-index/export/hooks/useExportRecords';
import { useEffect } from 'react';

export const ExportRecordsActionEffect = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();
  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const { progress, download } = useExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId: objectMetadataItem.namePlural,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  useEffect(() => {
    addActionMenuEntry({
      type: ActionMenuEntryType.Standard,
      scope:
        contextStoreNumberOfSelectedRecords > 0
          ? ActionMenuEntryScope.RecordSelection
          : ActionMenuEntryScope.Global,
      key: 'export',
      position,
      label: displayedExportProgress(progress),
      Icon: IconDatabaseExport,
      accent: 'default',
      onClick: () => download(),
    });

    return () => {
      removeActionMenuEntry('export');
    };
  }, [
    contextStoreNumberOfSelectedRecords,
    download,
    progress,
    addActionMenuEntry,
    removeActionMenuEntry,
    position,
  ]);

  return null;
};
