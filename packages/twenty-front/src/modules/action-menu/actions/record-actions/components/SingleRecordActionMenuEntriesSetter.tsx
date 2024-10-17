import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';

export const SingleRecordActionMenuEntriesSetter = () => {
  const actionEffects = [
    ManageFavoritesActionEffect,
    ExportRecordsActionEffect,
    DeleteRecordsActionEffect,
  ];
  return (
    <>
      {actionEffects.map((ActionEffect, index) => (
        <ActionEffect key={index} position={index} />
      ))}
    </>
  );
};
