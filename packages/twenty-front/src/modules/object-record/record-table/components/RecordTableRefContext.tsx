import { useRef } from 'react';

import { RecordTableRefContext } from '@/object-record/record-table/contexts/RecordTableRefContext';

export type RecordTableRefContextWrapperProps = {
  children: React.ReactNode;
};

export const RecordTableRefContextWrapper = ({
  children,
}: RecordTableRefContextWrapperProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <RecordTableRefContext.Provider value={tableRef}>
      {children}
    </RecordTableRefContext.Provider>
  );
};
