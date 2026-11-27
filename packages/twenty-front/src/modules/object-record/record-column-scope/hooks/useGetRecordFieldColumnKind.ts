import { RecordFieldColumnKindsContext } from '@/object-record/record-column-scope/contexts/RecordFieldColumnKindsContext';
import { type RecordFieldColumnKind } from '@/object-record/record-column-scope/types/RecordFieldColumnKind';
import { useContext } from 'react';

// For lists of columns; a single column reads useRecordFieldColumnKind
export const useGetRecordFieldColumnKind = () => {
  const columnKindByRecordFieldId = useContext(RecordFieldColumnKindsContext);

  return (recordFieldId: string): RecordFieldColumnKind =>
    columnKindByRecordFieldId[recordFieldId] ?? { kind: 'field' };
};
