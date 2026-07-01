import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useUnsubscribeTopics = () => {
  const { records, loading } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: 'unsubscribeTopic',
    recordGqlFields: {
      id: true,
      name: true,
      description: true,
      visibility: true,
    },
  });

  return { unsubscribeTopics: records, loading };
};
