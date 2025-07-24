import { Action } from '@/action-menu/actions/components/Action';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const ImportRecordsNoSelectionRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const hasImportCsvPermission = useHasSettingsPermission(
    PermissionFlagType.IMPORT_CSV,
  );
  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  return hasImportCsvPermission ? (
    <Action onClick={openObjectRecordsSpreadsheetImportDialog} />
  ) : null;
};
