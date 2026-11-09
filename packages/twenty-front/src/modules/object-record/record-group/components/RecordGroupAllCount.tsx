import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { isDefined } from 'twenty-shared/utils';

export const RecordGroupAllCount = () => {
  const { totalCount } = useGetRecordIndexTotalCount();

  return isDefined(totalCount) ? totalCount : '-';
};
