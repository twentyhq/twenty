import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordActionBar } from '@/object-record/record-action-bar/hooks/useRecordActionBar';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { useLoadRecordIndexBoard } from '@/object-record/record-index/hooks/useLoadRecordIndexBoard';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { computeRecordBoardColumnDefinitionsFromObjectMetadata } from '@/object-record/utils/computeRecordBoardColumnDefinitionsFromObjectMetadata';

type RecordIndexBoardContainerEffectProps = {
  objectNameSingular: string;
  recordBoardId: string;
  viewBarId: string;
};

export const RecordIndexBoardContainerEffect = ({
  objectNameSingular,
  recordBoardId,
  viewBarId,
}: RecordIndexBoardContainerEffectProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  useLoadRecordIndexBoard({ objectNameSingular, recordBoardId, viewBarId });

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    navigate(`/settings/objects/${objectMetadataItem.namePlural}`);
  }, [navigate, objectMetadataItem.namePlural]);

  const {
    setColumns,
    setObjectSingularName,
    getSelectedRecordIdsSelector,
    setFieldDefinitions,
  } = useRecordBoard(recordBoardId);
  const { resetRecordSelection } = useRecordBoardSelection(recordBoardId);

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

  const recordIndexFieldDefinitions = useRecoilValue(
    recordIndexFieldDefinitionsState,
  );

  useEffect(() => {
    setFieldDefinitions(recordIndexFieldDefinitions);
  }, [objectMetadataItem, setFieldDefinitions, recordIndexFieldDefinitions]);

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
