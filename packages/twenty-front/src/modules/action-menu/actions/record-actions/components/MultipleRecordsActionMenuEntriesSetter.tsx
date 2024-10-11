import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';

export const MultipleRecordsActionMenuEntriesSetter = () => {
  const actionEffects = [ExportRecordsActionEffect, DeleteRecordsActionEffect];
  return (
    <>
      {actionEffects.map((ActionEffect, index) => (
        <ActionEffect key={index} position={index} />
      ))}
    </>
  );
};
