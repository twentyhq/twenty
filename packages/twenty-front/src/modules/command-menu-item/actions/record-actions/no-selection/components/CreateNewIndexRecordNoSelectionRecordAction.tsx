import { CommandMenuItem } from '@/command-menu-item/actions/components/CommandMenuItem';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const CreateNewIndexRecordNoSelectionRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  return (
    <CommandMenuItem
      onClick={() => createNewIndexRecord({ position: 'first' })}
      closeSidePanelOnCommandMenuItemListActionExecution={false}
    />
  );
};
