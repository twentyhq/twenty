import { Command } from '@/command-menu-item/display/components/Command';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const CreateNewIndexRecordNoSelectionRecordCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { openDraftInSidePanel } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  return (
    <Command
      onClick={() => openDraftInSidePanel({ position: 'first' })}
      closeSidePanelOnCommandMenuListExecution={false}
    />
  );
};
