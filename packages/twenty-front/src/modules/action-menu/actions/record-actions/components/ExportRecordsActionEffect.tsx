import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import {
  displayedExportProgress,
  useExportTableData,
} from '@/object-record/record-index/options/hooks/useExportTableData';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconFileExport } from 'twenty-ui';

export const ExportRecordsActionEffect = ({
  position,
}: {
  position: number;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });

  const baseTableDataParams = {
    delayMs: 100,
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordIndexId: objectMetadataItem?.namePlural ?? '',
  };

  const { progress, download } = useExportTableData({
    ...baseTableDataParams,
    filename: `${objectMetadataItem?.nameSingular}.csv`,
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
