import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type ReactNode, useContext } from 'react';

export const RecordTableCellAggregateFieldContext = ({
  isAggregatedFieldReadable,
  children,
}: {
  isAggregatedFieldReadable: boolean;
  children: ReactNode;
}) => {
  const fieldContext = useContext(FieldContext);

  return (
    <FieldContext.Provider
      value={{
        ...fieldContext,
        isRecordFieldReadOnly: true,
        isForbidden: fieldContext.isForbidden || !isAggregatedFieldReadable,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
