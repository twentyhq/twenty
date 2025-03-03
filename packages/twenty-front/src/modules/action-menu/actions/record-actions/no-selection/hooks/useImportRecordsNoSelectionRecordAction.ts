import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';

export const useImportRecordsNoSelectionRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const { openObjectRecordsSpreasheetImportDialog } =
      useOpenObjectRecordsSpreadsheetImportDialog(
        objectMetadataItem.nameSingular,
      );

    return {
      shouldBeRegistered: true,
      onClick: () => {
        openObjectRecordsSpreasheetImportDialog();
      },
    };
  };
