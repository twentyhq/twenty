import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';

export const SingleRecordActionMenuEntriesSetter = () => {
  return (
    <>
      <ExportRecordsActionEffect />
      <DeleteRecordsActionEffect />
      <ManageFavoritesActionEffect />
    </>
  );
};
