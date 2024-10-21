import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const RecordShowContainerContextStoreEffect = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilState(
    contextStoreTargetedRecordsRuleState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
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
