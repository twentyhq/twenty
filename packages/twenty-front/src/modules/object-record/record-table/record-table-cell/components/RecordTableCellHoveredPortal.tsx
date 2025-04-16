import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { hoverPositionComponentState } from '@/object-record/record-table/states/hoverPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { useContext } from 'react';
import { BORDER_COMMON } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  isReadOnly: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ isReadOnly }) =>
    !isReadOnly ? BORDER_COMMON.radius.sm : 'none'};
  border-radius: ${BORDER_COMMON.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;

  height: 32px;

  outline: ${({ theme, isReadOnly }) =>
    isReadOnly
      ? `1px solid ${theme.border.color.medium}`
      : `1px solid ${theme.font.color.extraLight}`};

  position: relative;

  position: relative;
  user-select: none;
`;

const RecordTableCellHoveredPortalContent = () => {
  const hoverPosition = useRecoilComponentValueV2(hoverPositionComponentState);

  const isMobile = useIsMobile();

  const isFirstColumn = hoverPosition.column === 0;

  const { isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const showButton =
    !isFieldInputOnly && !isReadOnly && !(isMobile && isFirstColumn);

  return (
    <StyledRecordTableCellHoveredPortalContent isReadOnly={isReadOnly}>
      <RecordTableCellDisplayMode>
        <FieldDisplay />
      </RecordTableCellDisplayMode>
      {showButton && <RecordTableCellEditButton />}
    </StyledRecordTableCellHoveredPortalContent>
  );
};

export const RecordTableCellHoveredPortal = () => {
  const hoverPosition = useRecoilComponentValueV2(hoverPositionComponentState);

  return (
    <RecordTableCellPortalWrapper position={hoverPosition}>
      <RecordTableCellHoveredPortalContent />
    </RecordTableCellPortalWrapper>
  );
};
