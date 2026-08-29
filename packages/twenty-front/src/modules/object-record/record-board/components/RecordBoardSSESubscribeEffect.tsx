import { useCallback, useContext } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

export const RecordBoardSSESubscribeEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();
  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();

  const queryId = `record-board-${recordBoardId}`;

  const reloadBoard = useCallback(() => {
    triggerRecordBoardInitialQuery({ shouldResetScroll: false });
  }, [triggerRecordBoardInitialQuery]);

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combinedFilters,
        orderBy,
      },
    },
    onSseReconnected: reloadBoard,
  });

  return null;
};
