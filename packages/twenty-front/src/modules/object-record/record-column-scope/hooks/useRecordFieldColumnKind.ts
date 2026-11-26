import { useGetRecordFieldColumnKind } from '@/object-record/record-column-scope/hooks/useGetRecordFieldColumnKind';

export const useRecordFieldColumnKind = (recordFieldId: string) =>
  useGetRecordFieldColumnKind()(recordFieldId);
