import { type ReactNode } from 'react';

import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';

type RecordTableComponentInstanceProps = {
  children: ReactNode;
  recordTableId: string;
};

export const RecordTableComponentInstance = ({
  children,
  recordTableId,
}: RecordTableComponentInstanceProps) => {
  return (
    <RecordTableComponentInstanceContext.Provider
      value={{
        instanceId: recordTableId,
      }}
    >
      {children}
    </RecordTableComponentInstanceContext.Provider>
  );
};
