import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { assertNotNull } from '~/utils/assert';

export const useFieldPreviewValue = ({
  fieldName,
  objectNamePlural,
  skip,
}: {
  fieldName: string;
  objectNamePlural: string;
  skip?: boolean;
}) => {
  const { records } = useFindManyRecords({
    objectNamePlural,
    skip,
  });

  const firstRecordWithValue = records.find(
    (record) => assertNotNull(record[fieldName]) && record[fieldName] !== '',
  );

  return {
    value: firstRecordWithValue?.[fieldName],
  };
};
