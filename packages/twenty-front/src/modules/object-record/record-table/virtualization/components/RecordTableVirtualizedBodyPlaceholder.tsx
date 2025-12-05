import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

export const RECORD_TABLE_VIRTUALIZATION_BODY_PLACEHOLDER_WIDTH_CSS_VARIABLE_NAME =
  '--record-table-virtualization-body-placeholder-width';

const StyledVirtualizationContainer = styled.div<{
  height: number;
}>`
  height: ${({ height }) => height}px;
  width: var(
    ${RECORD_TABLE_VIRTUALIZATION_BODY_PLACEHOLDER_WIDTH_CSS_VARIABLE_NAME}
  );
`;

export const RecordTableVirtualizedBodyPlaceholder = () => {
  const totalNumberOfRecordsToVirtualize = useRecoilComponentValue(
    totalNumberOfRecordsToVirtualizeComponentState,
  );

  const totalHeight = isDefined(totalNumberOfRecordsToVirtualize)
    ? totalNumberOfRecordsToVirtualize * (RECORD_TABLE_ROW_HEIGHT + 1)
    : 0;

  return <StyledVirtualizationContainer height={totalHeight} />;
};
