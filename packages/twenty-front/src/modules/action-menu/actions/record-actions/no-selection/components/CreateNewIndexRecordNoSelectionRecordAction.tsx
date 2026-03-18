import { Action } from '@/action-menu/actions/components/Action';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const CreateNewIndexRecordNoSelectionRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { companyDuplicateWarningModal, createNewIndexRecord } =
    useCreateNewIndexRecord({
    objectMetadataItem,
  });

  return (
    <>
      <Action
        onClick={() => createNewIndexRecord({ position: 'first' })}
        closeSidePanelOnCommandMenuListActionExecution={false}
      />
      {companyDuplicateWarningModal}
    </>
  );
};
