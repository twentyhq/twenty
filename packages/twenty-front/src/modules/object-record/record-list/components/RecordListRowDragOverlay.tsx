import { type Draggable } from '@dnd-kit/dom';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordDragMultiDragCounterChip } from '@/object-record/record-drag/components/RecordDragMultiDragCounterChip';
import { type RecordDragData } from '@/object-record/record-drag/types/RecordDragData';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';

const StyledRowDragOverlay = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  position: relative;
`;

type RecordListRowDragOverlayProps = {
  source: Draggable | null;
};

export const RecordListRowDragOverlay = ({
  source,
}: RecordListRowDragOverlayProps) => {
  const sourceData = source?.data as RecordDragData | undefined;

  if (!isDefined(sourceData)) {
    return null;
  }

  return (
    <StyledRowDragOverlay>
      <RecordListRow recordId={sourceData.recordId} />
      <RecordDragMultiDragCounterChip />
    </StyledRowDragOverlay>
  );
};
