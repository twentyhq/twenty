import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { computeRecordBoardColumnDefinitionsFromObjectMetadata } from '@/object-record/utils/computeRecordBoardColumnDefinitionsFromObjectMetadata';

type RecordIndexBoardContainerEffectProps = {
  objectNamePlural: string;
  recordBoardId: string;
  viewBarId: string;
};

export const RecordIndexBoardContainerEffect = ({
  objectNamePlural,
  recordBoardId,
}: RecordIndexBoardContainerEffectProps) => {
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    navigate(`/settings/objects/${objectNamePlural}`);
  }, [navigate, objectNamePlural]);

  const { setRecordBoardColumns } = useRecordBoard(recordBoardId);

  useEffect(() => {
    setRecordBoardColumns(
      computeRecordBoardColumnDefinitionsFromObjectMetadata(
        objectMetadataItem,
        navigateToSelectSettings,
      ),
    );
  }, [
    navigateToSelectSettings,
    objectMetadataItem,
    objectNameSingular,
    setRecordBoardColumns,
  ]);

  return <></>;
};
