import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type ReactNode, useContext } from 'react';

export const RecordTableCellAggregateFieldContext = ({
  children,
}: {
  children: ReactNode;
}) => {
  const fieldContext = useContext(FieldContext);

  return (
    <FieldContext.Provider
      value={{ ...fieldContext, isRecordFieldReadOnly: true }}
    >
      {children}
    </FieldContext.Provider>
  );
};
