import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecoilCallback } from 'recoil';
import { mergeRecordsState } from '../states/mergeRecordsState';

type UseLoadMergeRecordsProps = {
  objectNameSingular: string;
  objectRecordIds: string[];
};

export const useLoadMergeRecords = ({
  objectNameSingular,
  objectRecordIds,
}: UseLoadMergeRecordsProps) => {
  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    filter: {
      id: {
        in: objectRecordIds,
      },
    },
  });

  const loadMergeRecords = useRecoilCallback(
    ({ set }) => {
      return async () => {
        const { records } = await findManyRecordsLazy();
        set(mergeRecordsState, records ?? []);
      };
    },
    [objectRecordIds, findManyRecordsLazy],
  );

  return {
    loadMergeRecords,
  };
};
