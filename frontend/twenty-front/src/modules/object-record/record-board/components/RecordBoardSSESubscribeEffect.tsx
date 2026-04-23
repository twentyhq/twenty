import { useContext } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

export const RecordBoardSSESubscribeEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  const queryId = `record-board-${recordBoardId}`;

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combinedFilters,
        orderBy,
      },
    },
  });

  return null;
};
