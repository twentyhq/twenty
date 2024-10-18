import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

export const RecordShowPageContextStoreEffect = ({
  recordId,
}: {
  recordId: string;
}) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilState(
    contextStoreTargetedRecordsRuleState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectNameSingular } = useParams();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular ?? '',
  });

  useEffect(() => {
    setContextStoreTargetedRecordsRule({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    setContextStoreCurrentObjectMetadataId(objectMetadataItem?.id);

    return () => {
      setContextStoreTargetedRecordsRule({
        mode: 'selection',
        selectedRecordIds: [],
      });
      setContextStoreCurrentObjectMetadataId(null);
    };
  }, [
    recordId,
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataId,
    objectMetadataItem?.id,
  ]);

  return null;
};
