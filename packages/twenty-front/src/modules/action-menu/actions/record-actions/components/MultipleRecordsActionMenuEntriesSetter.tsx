import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';

const actionEffects = [ExportRecordsActionEffect, DeleteRecordsActionEffect];

export const MultipleRecordsActionMenuEntriesSetter = () => {
  return (
    <>
      {actionEffects.map((ActionEffect, index) => (
        <ActionEffect key={index} position={index} />
      ))}
    </>
  );
};
