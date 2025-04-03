import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';

export const ImportRecordsNoSelectionRecordActionEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  useActionEffect(() => {
    openObjectRecordsSpreadsheetImportDialog();
  }, [openObjectRecordsSpreadsheetImportDialog]);

  return null;
};
