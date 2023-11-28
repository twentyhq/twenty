import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
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
  const { objects } = useFindManyObjectRecords({
    objectNamePlural,
    skip,
  });

  const firstRecordWithValue = objects.find(
    (record) => assertNotNull(record[fieldName]) && record[fieldName] !== '',
  );

  return {
    value: firstRecordWithValue?.[fieldName],
  };
};
