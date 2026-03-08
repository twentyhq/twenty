import { CommandMenuItemExecution } from '@/command-menu-item/display/components/CommandMenuItemExecution';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const CreateNewIndexRecordNoSelectionRecordCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  return (
    <CommandMenuItemExecution
      onClick={() => createNewIndexRecord({ position: 'first' })}
      closeSidePanelOnCommandMenuItemListActionExecution={false}
    />
  );
};
