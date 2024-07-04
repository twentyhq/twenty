import { useRecoilValue } from 'recoil';

import { RecordTableHeader } from '@/object-record/record-table/components/RecordTableHeader';
import { isRecordTableScrolledTopState } from '@/object-record/record-table/states/isRecordTableScrolledTopState';

export const RecordTableHeaderWrapper = ({
  createRecord,
}: {
  createRecord: () => void;
}) => {
  const isRecordTableScrolledTop = useRecoilValue(
    isRecordTableScrolledTopState,
  );

  return (
    <>
      {!isRecordTableScrolledTop ? (
        <RecordTableHeader
          createRecord={createRecord}
          isFrozen={!isRecordTableScrolledTop}
        />
      ) : (
        <RecordTableHeader createRecord={createRecord} />
      )}
    </>
  );
};
