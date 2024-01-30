import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getCachedRecordFromRecord = <T extends ObjectRecord>({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: T;
}): CachedObjectRecord<T> => {
  return {
    __typename: getNodeTypename({ objectNameSingular }),
    ...record,
  };
};
