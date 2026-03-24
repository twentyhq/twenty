import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { isDefined } from 'twenty-shared/utils';

export const ImportRecordsNoSelectionRecordCommand = () => {
  const { objectMetadataItem } = useMountedCommandState();

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
