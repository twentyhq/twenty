import { type ReactNode } from 'react';

import { type FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { RecordTableComponentInstanceEffect } from '@/object-record/record-table/components/RecordTableComponentInstanceEffect';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';

type RecordTableComponentInstanceProps = {
  children: ReactNode;
  recordTableId: string;
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableComponentInstance = ({
  children,
  recordTableId,
  onColumnsChange,
}: RecordTableComponentInstanceProps) => {
  return (
    <RecordTableComponentInstanceContext.Provider
      value={{
        instanceId: recordTableId,
        onColumnsChange,
      }}
    >
      <RecordTableComponentInstanceEffect onColumnsChange={onColumnsChange} />
      {children}
    </RecordTableComponentInstanceContext.Provider>
  );
};
