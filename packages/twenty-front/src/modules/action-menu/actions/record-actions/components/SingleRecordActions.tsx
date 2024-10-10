import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';

export const SingleRecordActions = () => {
  return (
    <>
      <ExportRecordsActionEffect />
      <ManageFavoritesActionEffect />
    </>
  );
};
