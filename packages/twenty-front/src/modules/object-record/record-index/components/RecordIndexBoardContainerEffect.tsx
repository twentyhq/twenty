import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
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
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const {
    setColumns,
    setObjectSingularName,
    selectedRecordIdsSelector,
    setFieldDefinitions,
    onFetchMoreVisibilityChangeState,
  } = useRecordBoard(recordBoardId);

  const { fetchMoreRecords, loading } = useLoadRecordIndexBoard({
    objectNameSingular,
    recordBoardId,
    viewBarId,
  });

  const setOnFetchMoreVisibilityChange = useSetRecoilState(
    onFetchMoreVisibilityChangeState,
  );

  useEffect(() => {
    setOnFetchMoreVisibilityChange(() => () => {
      if (!loading) {
        fetchMoreRecords?.();
      }
    });
  }, [fetchMoreRecords, loading, setOnFetchMoreVisibilityChange]);

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    navigate(`/settings/objects/${objectMetadataItem.namePlural}/stage`);
  }, [navigate, objectMetadataItem.namePlural]);

  const { createOneRecord: createOneObject } = useCreateOneRecord({
    objectNameSingular,
  });

  const createEmptyObjectWithStage = useCallback(async () => {
    await createOneObject?.({
      position: 'first',
    });
  }, [createOneObject]);

  const { resetRecordSelection } = useRecordBoardSelection(recordBoardId);

  useEffect(() => {
    setObjectSingularName(objectNameSingular);
  }, [objectNameSingular, setObjectSingularName]);

  useEffect(() => {
    setColumns(
      computeRecordBoardColumnDefinitionsFromObjectMetadata(
        objectMetadataItem,
        navigateToSelectSettings,
        createEmptyObjectWithStage,
      ),
    );
  }, [
    navigateToSelectSettings,
    createEmptyObjectWithStage,
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

  const selectedRecordIds = useRecoilValue(selectedRecordIdsSelector());

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
