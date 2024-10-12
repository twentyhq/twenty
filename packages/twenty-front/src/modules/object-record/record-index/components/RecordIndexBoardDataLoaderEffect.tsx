import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { computeRecordBoardColumnDefinitionsFromObjectMetadata } from '@/object-record/utils/computeRecordBoardColumnDefinitionsFromObjectMetadata';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

type RecordIndexBoardDataLoaderEffectProps = {
  objectNameSingular: string;
  recordBoardId: string;
};

export const RecordIndexBoardDataLoaderEffect = ({
  objectNameSingular,
  recordBoardId,
}: RecordIndexBoardDataLoaderEffectProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordIndexFieldDefinitions = useRecoilValue(
    recordIndexFieldDefinitionsState,
  );

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const recordIndexIsCompactModeActive = useRecoilValue(
    recordIndexIsCompactModeActiveState,
  );

  const { isCompactModeActiveState } = useRecordBoard(recordBoardId);

  const setIsCompactModeActive = useSetRecoilState(isCompactModeActiveState);

  useEffect(() => {
    setIsCompactModeActive(recordIndexIsCompactModeActive);
  }, [recordIndexIsCompactModeActive, setIsCompactModeActive]);

  const {
    setColumns,
    setObjectSingularName,
    selectedRecordIdsSelector,
    setFieldDefinitions,
    setKanbanFieldMetadataName,
  } = useRecordBoard(recordBoardId);

  useEffect(() => {
    setFieldDefinitions(recordIndexFieldDefinitions);
  }, [recordIndexFieldDefinitions, setFieldDefinitions]);

  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);
    navigate(`/settings/objects/${getObjectSlug(objectMetadataItem)}`);
  }, [
    navigate,
    objectMetadataItem,
    location.pathname,
    location.search,
    setNavigationMemorizedUrl,
  ]);

  useEffect(() => {
    setObjectSingularName(objectNameSingular);
  }, [objectNameSingular, setObjectSingularName]);

  useEffect(() => {
    setColumns(
      computeRecordBoardColumnDefinitionsFromObjectMetadata(
        objectMetadataItem,
        recordIndexKanbanFieldMetadataId ?? '',
        navigateToSelectSettings,
      ),
    );
  }, [
    navigateToSelectSettings,
    objectMetadataItem,
    objectNameSingular,
    recordIndexKanbanFieldMetadataId,
    setColumns,
  ]);

  useEffect(() => {
    setFieldDefinitions(recordIndexFieldDefinitions);
  }, [objectMetadataItem, setFieldDefinitions, recordIndexFieldDefinitions]);

  useEffect(() => {
    if (isDefined(recordIndexKanbanFieldMetadataId)) {
      const kanbanFieldMetadataName = objectMetadataItem?.fields.find(
        (field) =>
          field.type === FieldMetadataType.Select &&
          field.id === recordIndexKanbanFieldMetadataId,
      )?.name;

      if (isDefined(kanbanFieldMetadataName)) {
        setKanbanFieldMetadataName(kanbanFieldMetadataName);
      }
    }
  }, [
    objectMetadataItem,
    recordIndexKanbanFieldMetadataId,
    setKanbanFieldMetadataName,
  ]);

  const selectedRecordIds = useRecoilValue(selectedRecordIdsSelector());

  const setContextStoreTargetedRecordIds = useSetRecoilState(
    contextStoreTargetedRecordIdsState,
  );

  const setContextStoreCurrentObjectMetadataItem = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );

  useEffect(() => {
    setContextStoreTargetedRecordIds(selectedRecordIds);
  }, [selectedRecordIds, setContextStoreTargetedRecordIds]);

  useEffect(() => {
    setContextStoreTargetedRecordIds(selectedRecordIds);
    setContextStoreCurrentObjectMetadataItem(objectMetadataItem?.id);

    return () => {
      setContextStoreTargetedRecordIds([]);
      setContextStoreCurrentObjectMetadataItem(null);
    };
  }, [
    objectMetadataItem?.id,
    selectedRecordIds,
    setContextStoreCurrentObjectMetadataItem,
    setContextStoreTargetedRecordIds,
  ]);

  return <></>;
};
