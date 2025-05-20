import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilValue } from 'recoil';

export const useRecordFieldValue = <T,>(
  recordId: string,
  fieldName: string,
) => {
  const recordFieldValue = useRecoilValue(
    recordStoreFamilySelector({
      recordId,
      fieldName,
    }),
  );

  return recordFieldValue as T | undefined;
};
