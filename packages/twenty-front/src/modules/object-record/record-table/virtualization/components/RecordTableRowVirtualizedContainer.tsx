import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { RecordTableRowVirtualizedDebugRowHelper } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedDebugRowHelper';
import { RecordTableRowVirtualizedRouterLevel1 } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedRouterLevel1';
import { TABLE_VIRTUALIZATION_DEBUG_ACTIVATED } from '@/object-record/record-table/virtualization/constants/TableVirtualizationDebugActivated';

import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';

import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledVirtualizedRowContainer = styled.div<{
  pixelsFromTop: number;
}>`
  height: ${RECORD_TABLE_ROW_HEIGHT + 1};
  position: absolute;
  top: ${({ pixelsFromTop }) => pixelsFromTop}px;
`;

type RecordTableRowVirtualizedContainerProps = {
  virtualIndex: number;
};

export const RecordTableRowVirtualizedContainer = ({
  virtualIndex,
}: RecordTableRowVirtualizedContainerProps) => {
  const realIndexByVirtualIndex = useAtomComponentFamilyStateValue(
    realIndexByVirtualIndexComponentFamilyState,
    { virtualIndex },
  );

  const totalNumberOfRecordsToVirtualize =
    useAtomComponentStateValue(
      totalNumberOfRecordsToVirtualizeComponentState,
    ) ?? 0;

  if (
    !isDefined(realIndexByVirtualIndex) ||
    realIndexByVirtualIndex >= totalNumberOfRecordsToVirtualize
  ) {
    return null;
  }

  const pixelsFromTop =
    realIndexByVirtualIndex * (RECORD_TABLE_ROW_HEIGHT + 1) +
    (RECORD_TABLE_ROW_HEIGHT + 1);

  return (
    <StyledVirtualizedRowContainer
      id={`row-virtual-index-${virtualIndex}`}
      pixelsFromTop={pixelsFromTop}
    >
      {TABLE_VIRTUALIZATION_DEBUG_ACTIVATED && (
        <RecordTableRowVirtualizedDebugRowHelper virtualIndex={virtualIndex} />
      )}
      <RecordTableRowVirtualizedRouterLevel1
        realIndex={realIndexByVirtualIndex}
      />
    </StyledVirtualizedRowContainer>
  );
};
