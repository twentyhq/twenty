import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { isDefined } from 'twenty-shared/utils';

export const ImportRecordsNoSelectionRecordCommand = () => {
  const { objectMetadataItem } = useEngineCommandExecutionContext();

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata item is required to import records');
  }

  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={openObjectRecordsSpreadsheetImportDialog}
    />
  );
};
