import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { RecordTableRowVirtualizedDebugRowHelper } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedDebugRowHelper';
import { RecordTableRowVirtualizedRouterLevel1 } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedRouterLevel1';
import { TABLE_VIRTUALIZATION_DEBUG_ACTIVATED } from '@/object-record/record-table/virtualization/constants/TableVirtualizationDebugActivated';

import { isVirtualRowDisplayedComponentFamilySelector } from '@/object-record/record-table/virtualization/states/isVirtualRowDisplayedComponentFamilySelector';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';

import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledVirtualizedRowContainer = styled.div<{
  pixelsFromTop: number;
}>`
  height: 33px;
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

  const isVirtualRowDisplayed = useAtomComponentFamilySelectorValue(
    isVirtualRowDisplayedComponentFamilySelector,
    virtualIndex,
  );

  if (!isDefined(realIndexByVirtualIndex) || !isVirtualRowDisplayed) {
    return null;
  }

  const pixelsFromTop =
    realIndexByVirtualIndex * (RECORD_TABLE_ROW_HEIGHT + 1) +
    (RECORD_TABLE_ROW_HEIGHT + 1);

  return (
    <StyledVirtualizedRowContainer
      id={`row-virtual-index-${virtualIndex}`}
      pixelsFromTop={pixelsFromTop}
      data-replay-ignore-mutations="true"
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
