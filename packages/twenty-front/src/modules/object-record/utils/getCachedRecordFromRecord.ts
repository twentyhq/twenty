import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getNodeTypename } from '@/object-record/utils/getNodeTypename';

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
