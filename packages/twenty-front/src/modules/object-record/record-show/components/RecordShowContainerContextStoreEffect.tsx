import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const RecordShowContainerContextStoreEffect = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
  });

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentStateV2(
    contextStoreNumberOfSelectedRecordsComponentState,
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
