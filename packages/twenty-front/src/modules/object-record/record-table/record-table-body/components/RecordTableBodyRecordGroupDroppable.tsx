import { SENTRY_REPLAY_IGNORE_MUTATIONS_PROPS } from '@/error-handler/constants/SentryReplayIgnoreMutationsProps';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyDroppableContextProvider } from '@/object-record/record-table/record-table-body/contexts/RecordTableBodyDroppableContext';
import { Droppable } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

type RecordTableBodyRecordGroupDroppableProps = {
  children: ReactNode;
  recordGroupId: string;
  isDropDisabled?: boolean;
};

export const RecordTableBodyRecordGroupDroppable = ({
  children,
  recordGroupId,
  isDropDisabled,
}: RecordTableBodyRecordGroupDroppableProps) => {
  return (
    <Droppable
      droppableId={recordGroupId}
      isDropDisabled={isDropDisabled}
      mode={'standard'}
    >
      {(provided) => (
        <RecordTableBody
          ref={provided.innerRef}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
          // Grouped rows are real DOM (no virtualization cap): row batches on
          // group toggle / load-more / navigation are expensive for rrweb
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...SENTRY_REPLAY_IGNORE_MUTATIONS_PROPS}
        >
          <RecordTableBodyDroppableContextProvider
            value={{ droppablePlaceholder: provided.placeholder }}
          >
            {children}
          </RecordTableBodyDroppableContextProvider>
        </RecordTableBody>
      )}
    </Droppable>
  );
};
