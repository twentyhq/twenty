import { MultipleRecordsActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/MultipleRecordsActionMenuEntriesSetter';
import { SingleRecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/SingleRecordActionMenuEntriesSetter';
import { ActionMenuType } from '@/action-menu/types/ActionMenuType';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilValue } from 'recoil';

export const RecordActionMenuEntriesSetter = ({
  actionMenuType,
}: {
  actionMenuType: ActionMenuType;
}) => {
  const contextStoreNumberOfSelectedRecords = useRecoilValue(
    contextStoreNumberOfSelectedRecordsState,
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

  if (!contextStoreNumberOfSelectedRecords) {
    return null;
  }

  if (contextStoreNumberOfSelectedRecords === 1) {
    return (
      <SingleRecordActionMenuEntriesSetter
        objectMetadataItem={objectMetadataItem}
        actionMenuType={actionMenuType}
      />
    );
  }

  return (
    <MultipleRecordsActionMenuEntriesSetter
      objectMetadataItem={objectMetadataItem}
      actionMenuType={actionMenuType}
    />
  );
};
