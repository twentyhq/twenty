import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { FetchMoreLoader } from '@/ui/utilities/loading-state/components/FetchMoreLoader';

type RecordTableBodyFetchMoreLoaderProps = {
  objectNameSingular: string;
};

export const RecordTableBodyFetchMoreLoader = ({
  objectNameSingular,
}: RecordTableBodyFetchMoreLoaderProps) => {
  const { queryStateIdentifier } = useLoadRecordIndexTable(objectNameSingular);
  const { setRecordTableLastRowVisible } = useRecordTable();

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  const onLastRowVisible = useRecoilCallback(
    () => async (inView: boolean) => {
      setRecordTableLastRowVisible(inView);
    },
    [setRecordTableLastRowVisible],
  );

  return (
    <FetchMoreLoader
      loading={isFetchingMoreObjects}
      onLastRowVisible={onLastRowVisible}
    />
  );
};
