import { useRecoilValue } from 'recoil';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

type RecordTableBodyProps = {
  objectNameSingular: string;
};

export const RecordTableBody = ({
  objectNameSingular,
}: RecordTableBodyProps) => {
  const { getTableRowIdsState } = useRecordTableStates();

  const tableRowIds = useRecoilValue(getTableRowIdsState());

  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  return (
    <>
      <tbody>
        {tableRowIds.map((rowId, rowIndex) => (
          <RecordTableRowContext.Provider
            value={{
              recordId: rowId,
              rowIndex,
              pathToShowPage: getBasePathToShowPage({ objectMetadataItem }),
            }}
            key={rowId}
          >
            <RecordTableRow key={rowId} rowId={rowId} />
          </RecordTableRowContext.Provider>
        ))}
      </tbody>
      <RecordTableBodyFetchMoreLoader objectNameSingular={objectNameSingular} />
    </>
  );
};
