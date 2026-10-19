import { styled } from '@linaria/react';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

import { RecordTableNoRecordGroupAddNewDropZone } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNewDropZone';
import { RecordTableRowVirtualizedContainer } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedContainer';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDebugHelper } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDebugHelper';
import { numberOfDisplayedVirtualRowsComponentSelector } from '@/object-record/record-table/virtualization/states/numberOfDisplayedVirtualRowsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

const StyledNoRecordGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const RecordTableNoRecordGroupRows = () => {
  const numberOfDisplayedVirtualRows = useAtomComponentSelectorValue(
    numberOfDisplayedVirtualRowsComponentSelector,
  );

  const virtualRowIndices = getContiguousIncrementalValues(
    numberOfDisplayedVirtualRows,
  );

  return (
    <StyledNoRecordGroupContainer>
      <RecordTableVirtualizedBodyPlaceholder />
      {virtualRowIndices.map((virtualRowIndex) => {
        return (
          <RecordTableRowVirtualizedContainer
            key={virtualRowIndex}
            virtualIndex={virtualRowIndex}
          />
        );
      })}
      <RecordTableNoRecordGroupAddNewDropZone />
      <RecordTableVirtualizedDebugHelper />
    </StyledNoRecordGroupContainer>
  );
};
