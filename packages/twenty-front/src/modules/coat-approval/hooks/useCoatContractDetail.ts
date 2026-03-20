import { COAT_DETAIL_GQL_FIELDS } from '@/coat-approval/constants/CoatDetailGqlFields.constants';
import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

export const useCoatContractDetail = (contractId: string | null) => {
  const { record, loading, error } = useFindOneRecord({
    objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
    objectRecordId: contractId ?? '',
    recordGqlFields: COAT_DETAIL_GQL_FIELDS,
    skip: !contractId,
  });

  return {
    contract: record,
    loading,
    error,
  };
};
