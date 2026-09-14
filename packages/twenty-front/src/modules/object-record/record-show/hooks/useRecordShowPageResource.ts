import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRecordShowPageOperationSignature } from '@/object-record/record-show/hooks/useRecordShowPageOperationSignature';

export const useRecordShowPageResource = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}) => {
  const operationSignature = useRecordShowPageOperationSignature({
    objectNameSingular,
  });

  const queryResult = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular,
    recordGqlFields: operationSignature.fields,
    withSoftDeleted: true,
  });

  return queryResult;
};
