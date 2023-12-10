import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
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
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { records } = useFindManyRecords({
    objectNameSingular,
    skip,
  });

  const firstRecordWithValue = records.find(
    (record) => assertNotNull(record[fieldName]) && record[fieldName] !== '',
  );

  return {
    value: firstRecordWithValue?.[fieldName],
  };
};
