import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

export const RecordShowPageContextStoreEffect = ({
  recordId,
}: {
  recordId: string;
}) => {
  const setContextStoreTargetedRecordIds = useSetRecoilState(
    contextStoreTargetedRecordIdsState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectNameSingular } = useParams();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular ?? '',
  });

  useEffect(() => {
    setContextStoreTargetedRecordIds([recordId]);
    setContextStoreCurrentObjectMetadataId(objectMetadataItem?.id);

    return () => {
      setContextStoreTargetedRecordIds([]);
      setContextStoreCurrentObjectMetadataId(null);
    };
  }, [
    recordId,
    setContextStoreTargetedRecordIds,
    setContextStoreCurrentObjectMetadataId,
    objectMetadataItem?.id,
  ]);

  return null;
};
