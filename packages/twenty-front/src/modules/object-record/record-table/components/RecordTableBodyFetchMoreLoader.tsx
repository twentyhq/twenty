import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { FetchMoreLoader } from '@/ui/utilities/loading-state/components/FetchMoreLoader';

type RecordTableBodyFetchMoreLoaderProps = {
  objectNamePlural: string;
};

export const RecordTableBodyFetchMoreLoader = ({
  objectNamePlural,
}: RecordTableBodyFetchMoreLoaderProps) => {
  const { queryStateIdentifier } = useObjectRecordTable(objectNamePlural);
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
