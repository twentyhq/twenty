import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordActionBar } from '@/object-record/record-action-bar/hooks/useRecordActionBar';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { useResetBoardRecordSelection } from '@/object-record/record-board/hooks/useResetBoardRecordSelection';
import { useLoadRecordIndexBoard } from '@/object-record/record-index/hooks/useLoadRecordIndexBoard';
import { computeRecordBoardColumnDefinitionsFromObjectMetadata } from '@/object-record/utils/computeRecordBoardColumnDefinitionsFromObjectMetadata';

type RecordIndexBoardContainerEffectProps = {
  objectNameSingular: string;
  recordBoardId: string;
  viewBarId: string;
};

export const RecordIndexBoardContainerEffect = ({
  objectNameSingular,
  recordBoardId,
}: RecordIndexBoardContainerEffectProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  useLoadRecordIndexBoard(objectNameSingular, recordBoardId);

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    navigate(`/settings/objects/${objectMetadataItem.namePlural}`);
  }, [navigate, objectMetadataItem.namePlural]);

  const { setColumns, setObjectSingularName, getSelectedRecordIdsSelector } =
    useRecordBoard(recordBoardId);
  const { resetRecordSelection } = useResetBoardRecordSelection(recordBoardId);

  useEffect(() => {
    setObjectSingularName(objectNameSingular);
  }, [objectNameSingular, setObjectSingularName]);

  useEffect(() => {
    setColumns(
      computeRecordBoardColumnDefinitionsFromObjectMetadata(
        objectMetadataItem,
        navigateToSelectSettings,
      ),
    );
  }, [
    navigateToSelectSettings,
    objectMetadataItem,
    objectNameSingular,
    setColumns,
  ]);

  const selectedRecordIds = useRecoilValue(getSelectedRecordIdsSelector());

  const { setActionBarEntries, setContextMenuEntries } = useRecordActionBar({
    objectMetadataItem,
    selectedRecordIds,
    callback: resetRecordSelection,
  });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  return <></>;
};
