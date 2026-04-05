import { JUSTUS_TRUTH_OBJECT_NAME_SINGULAR } from '@/data-validator/constants/JustusTruthObjectName.constants';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const MINIMAL_FIELDS = { id: true };

export const useJustusTruthStats = () => {
  const { totalCount: total, loading: loadingTotal } = useFindManyRecords({
    objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
    recordGqlFields: MINIMAL_FIELDS,
    limit: 1,
  });

  const { totalCount: candidate, loading: loadingCandidate } =
    useFindManyRecords({
      objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
      filter: { status: { eq: 'candidate' } },
      recordGqlFields: MINIMAL_FIELDS,
      limit: 1,
    });

  const { totalCount: approved } = useFindManyRecords({
    objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
    filter: { status: { eq: 'approved' } },
    recordGqlFields: MINIMAL_FIELDS,
    limit: 1,
  });

  const { totalCount: supported } = useFindManyRecords({
    objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
    filter: { status: { eq: 'supported' } },
    recordGqlFields: MINIMAL_FIELDS,
    limit: 1,
  });

  const { totalCount: deprecated } = useFindManyRecords({
    objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
    filter: { status: { eq: 'deprecated' } },
    recordGqlFields: MINIMAL_FIELDS,
    limit: 1,
  });

  const totalVal = total ?? 0;
  const candidateVal = candidate ?? 0;
  const reviewedCount = totalVal - candidateVal;
  const progressPercent =
    totalVal > 0 ? Math.round((reviewedCount / totalVal) * 100) : 0;

  return {
    total: totalVal,
    candidate: candidateVal,
    approved: approved ?? 0,
    supported: supported ?? 0,
    deprecated: deprecated ?? 0,
    reviewedCount,
    progressPercent,
    loading: loadingTotal || loadingCandidate,
  };
};
