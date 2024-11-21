import { MultipleRecordsActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/multiple-records/components/MultipleRecordsActionMenuEntrySetterEffect';
import { NoSelectionActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/no-selection/components/NoSelectionActionMenuEntrySetterEffect';
import { SingleRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/single-record/components/SingleRecordActionMenuEntrySetterEffect';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId ?? '',
  });

  if (!objectMetadataItem) {
    throw new Error(
      `Object metadata item not found for id ${contextStoreCurrentObjectMetadataId}`,
    );
  }

  return (
    <>
      {contextStoreNumberOfSelectedRecords === 0 && (
        <NoSelectionActionMenuEntrySetterEffect
          objectMetadataItem={objectMetadataItem}
        />
      )}
      {contextStoreNumberOfSelectedRecords === 1 && (
        <SingleRecordActionMenuEntrySetterEffect
          objectMetadataItem={objectMetadataItem}
        />
      )}
      {contextStoreNumberOfSelectedRecords > 1 && (
        <MultipleRecordsActionMenuEntrySetterEffect
          objectMetadataItem={objectMetadataItem}
        />
      )}
    </>
  );
};
