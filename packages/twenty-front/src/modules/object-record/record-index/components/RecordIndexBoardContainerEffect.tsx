import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useRecordActionBar } from '@/object-record/record-action-bar/hooks/useRecordActionBar';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { useLoadRecordIndexBoard } from '@/object-record/record-index/hooks/useLoadRecordIndexBoard';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { computeRecordBoardColumnDefinitionsFromObjectMetadata } from '@/object-record/utils/computeRecordBoardColumnDefinitionsFromObjectMetadata';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

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
    getSelectedRecordIdsSelector,
    setFieldDefinitions,
    getOnFetchMoreVisibilityChangeState,
  } = useRecordBoard(recordBoardId);

  const { currentViewSelector } = useViewScopedStates({
    viewScopeId: viewBarId,
  });
  const currentView = useRecoilValue(currentViewSelector);
  const { getIsCompactModeActiveState } = useRecordBoard(recordBoardId);
  const [isCompactModeActive, setIsCompactModeActive] = useRecoilState(
    getIsCompactModeActiveState(),
  );

  const { fetchMoreRecords, loading } = useLoadRecordIndexBoard({
    objectNameSingular,
    recordBoardId,
    viewBarId,
  });

  const setOnFetchMoreVisibilityChange = useSetRecoilState(
    getOnFetchMoreVisibilityChangeState(),
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
    navigate(`/settings/objects/${objectMetadataItem.namePlural}`);
  }, [navigate, objectMetadataItem.namePlural]);

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

  useEffect(() => {
    if (currentView?.isCompact !== isCompactModeActive) {
      setIsCompactModeActive(!!currentView?.isCompact);
    }
    // We don't want to re-run this effect when the state changes.
    // We only want to make sure that the state reflects the current view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  return <></>;
};
