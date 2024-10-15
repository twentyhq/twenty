import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

export const RecordShowPageContextStoreEffect = ({
  recordId,
}: {
  recordId: string;
}) => {
  const setcontextStoreTargetedRecords = useSetRecoilState(
    contextStoreTargetedRecordsState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectNameSingular } = useParams();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular ?? '',
  });

  useEffect(() => {
    setcontextStoreTargetedRecords({
      selectedRecordIds: [recordId],
      excludedRecordIds: [],
    });
    setContextStoreCurrentObjectMetadataId(objectMetadataItem?.id);

    return () => {
      setcontextStoreTargetedRecords({
        selectedRecordIds: [],
        excludedRecordIds: [],
      });
      setContextStoreCurrentObjectMetadataId(null);
    };
  }, [
    recordId,
    setcontextStoreTargetedRecords,
    setContextStoreCurrentObjectMetadataId,
    objectMetadataItem?.id,
  ]);

  return null;
};
