import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import {
  displayedExportProgress,
  useExportTableData,
} from '@/object-record/record-index/options/hooks/useExportTableData';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconFileExport } from 'twenty-ui';

export const ExportRecordsActionEffect = () => {
  const setActionMenuEntries = useSetRecoilComponentStateV2(
    actionMenuEntriesComponentState,
  );
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
    setActionMenuEntries((prev) => {
      const newEntries = new Map(prev);
      newEntries.set('export', {
        label: displayedExportProgress(progress),
        Icon: IconFileExport,
        accent: 'default',
        onClick: () => download(),
      });
      return newEntries;
    });
  }, [download, progress, setActionMenuEntries]);
  return <></>;
};
