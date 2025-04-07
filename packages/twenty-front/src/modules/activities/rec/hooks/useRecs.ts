import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useRecs = () => {
  const { records, loading } = useFindManyRecords<any>({
    skip: false,
    objectNameSingular: CoreObjectNameSingular.Vehicle,
    filter: {},
  });

  return {
    records,
    loading,
  };
};
