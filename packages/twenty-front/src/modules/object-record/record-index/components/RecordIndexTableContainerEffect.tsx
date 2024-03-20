import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordActionBar } from '@/object-record/record-action-bar/hooks/useRecordActionBar';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useSetRecordCountInCurrentView } from '@/views/hooks/useSetRecordCountInCurrentView';

type RecordIndexTableContainerEffectProps = {
  objectNameSingular: string;
  recordTableId: string;
  viewBarId: string;
};

export const RecordIndexTableContainerEffect = ({
  objectNameSingular,
  recordTableId,
  viewBarId,
}: RecordIndexTableContainerEffectProps) => {
  const {
    setAvailableTableColumns,
    setOnEntityCountChange,
    resetTableRowSelection,
    selectedRowIdsSelector,
  } = useRecordTable({
    recordTableId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { setRecordCountInCurrentView } =
    useSetRecordCountInCurrentView(viewBarId);

  useEffect(() => {
    setAvailableTableColumns(columnDefinitions);
  }, [columnDefinitions, setAvailableTableColumns]);

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const { setActionBarEntries, setContextMenuEntries } = useRecordActionBar({
    objectMetadataItem,
    selectedRecordIds: selectedRowIds,
    callback: resetTableRowSelection,
  });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setRecordCountInCurrentView(entityCount),
    );
  }, [setRecordCountInCurrentView, setOnEntityCountChange]);

  return <></>;
};
