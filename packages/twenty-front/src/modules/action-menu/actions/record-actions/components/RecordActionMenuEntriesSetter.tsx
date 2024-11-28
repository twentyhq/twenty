import { MultipleRecordsActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/multiple-records/components/MultipleRecordsActionMenuEntrySetterEffect';
import { NoSelectionActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/no-selection/components/NoSelectionActionMenuEntrySetterEffect';
import { SingleRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/single-record/components/SingleRecordActionMenuEntrySetterEffect';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  if (!isDefined(contextStoreCurrentObjectMetadataId)) {
    return null;
  }

  return (
    <ActionEffects objectMetadataItemId={contextStoreCurrentObjectMetadataId} />
  );
};

const ActionEffects = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

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
