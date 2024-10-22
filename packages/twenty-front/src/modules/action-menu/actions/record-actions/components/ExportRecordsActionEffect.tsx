import {
  displayedExportProgress,
  useExportRecordData,
} from '@/action-menu/hooks/useExportRecordData';
import { useContextStoreActionMenuEntries } from '@/context-store/hooks/useContextStoreActionMenuEntries';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { useEffect } from 'react';
import { IconFileExport } from 'twenty-ui';

export const ExportRecordsActionEffect = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } =
    useContextStoreActionMenuEntries();

  const { progress, download } = useExportRecordData({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId: objectMetadataItem.namePlural,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  useEffect(() => {
    addActionMenuEntry({
      key: 'export',
      position,
      label: displayedExportProgress(progress),
      Icon: IconFileExport,
      accent: 'default',
      onClick: () => download(),
    });

    return () => {
      removeActionMenuEntry('export');
    };
  }, [download, progress, addActionMenuEntry, removeActionMenuEntry, position]);
  return null;
};
