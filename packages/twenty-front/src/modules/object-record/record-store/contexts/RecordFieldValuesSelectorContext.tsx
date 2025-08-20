import { recordFieldsStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordFieldsStoreFamilySelector';
import { useRecoilValue } from 'recoil';

export const useRecordFieldValues = <T,>(
  recordId: string,
  fieldNames: string[],
) => {
  const recordFieldValues = useRecoilValue(
    recordFieldsStoreFamilySelector({
      recordId,
      fieldNames,
    }),
  );

  return recordFieldValues as T | undefined;
};
