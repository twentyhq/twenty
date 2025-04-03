import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { useEffect } from 'react';

export const ImportRecordsNoSelectionRecordActionEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  useEffect(() => {
    openObjectRecordsSpreadsheetImportDialog();
  }, [openObjectRecordsSpreadsheetImportDialog]);

  return null;
};
