import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
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

  const setContextStoreNumberOfSelectedRecords = useSetRecoilState(
    contextStoreNumberOfSelectedRecordsState,
  );

  useEffect(() => {
    setContextStoreTargetedRecordsRule({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    setContextStoreCurrentObjectMetadataId(objectMetadataItem?.id);
    setContextStoreNumberOfSelectedRecords(1);

    return () => {
      setContextStoreTargetedRecordsRule({
        mode: 'selection',
        selectedRecordIds: [],
      });
      setContextStoreCurrentObjectMetadataId(null);
      setContextStoreNumberOfSelectedRecords(0);
    };
  }, [
    recordId,
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataId,
    objectMetadataItem?.id,
    setContextStoreNumberOfSelectedRecords,
  ]);

  return null;
};
