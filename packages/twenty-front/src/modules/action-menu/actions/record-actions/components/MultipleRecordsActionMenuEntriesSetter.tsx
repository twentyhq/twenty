import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';

export const MultipleRecordsActionMenuEntriesSetter = () => {
  return (
    <>
      <ExportRecordsActionEffect />
      <DeleteRecordsActionEffect />
    </>
  );
};
