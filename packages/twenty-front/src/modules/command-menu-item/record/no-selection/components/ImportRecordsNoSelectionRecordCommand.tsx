import { CommandMenuItemExecution } from '@/command-menu-item/display/components/CommandMenuItemExecution';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';

export const ImportRecordsNoSelectionRecordCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  return (
    <CommandMenuItemExecution
      onClick={openObjectRecordsSpreadsheetImportDialog}
    />
  );
};
