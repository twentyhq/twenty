import { type ReactNode } from 'react';

import { RecordDragEndDropZone } from '@/object-record/record-drag/components/RecordDragEndDropZone';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

type RecordTableRecordGroupEndDropZoneProps = {
  children: ReactNode;
};

export const RecordTableRecordGroupEndDropZone = ({
  children,
}: RecordTableRecordGroupEndDropZoneProps) => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  return (
    <RecordDragEndDropZone
      droppableId={currentRecordGroupId}
      dndType={RECORD_TABLE_ROW_DND_TYPE}
      index={recordIndexRecordIdsByGroup.length}
    >
      {children}
    </RecordDragEndDropZone>
  );
};
