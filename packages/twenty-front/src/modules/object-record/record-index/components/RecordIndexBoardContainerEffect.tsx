import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
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

  const { setColumns } = useRecordBoard(recordBoardId);

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

  return <></>;
};
