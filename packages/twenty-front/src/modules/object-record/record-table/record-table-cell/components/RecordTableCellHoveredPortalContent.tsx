import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { hoverPositionComponentState } from '@/object-record/record-table/states/hoverPositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { BORDER_COMMON } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  isReadOnly: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  border-radius: ${BORDER_COMMON.radius.sm};

  background: ${({ theme }) => theme.background.transparent.secondary};

  border-radius: ${({ isReadOnly }) =>
    !isReadOnly ? BORDER_COMMON.radius.sm : 'none'};

  outline: ${({ theme, isReadOnly }) =>
    isReadOnly
      ? `1px solid ${theme.border.color.medium}`
      : `1px solid ${theme.font.color.extraLight}`};
  width: 100%;
  height: 100%;
  position: relative;
`;

export const RecordTableCellHoveredPortalContent = () => {
  const hoverPosition = useRecoilComponentValueV2(hoverPositionComponentState);

  const isInEditMode = useRecoilComponentFamilyValueV2(
    isTableCellInEditModeComponentFamilyState,
    hoverPosition,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = hoverPosition.column === 0;

  const { isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const showButton =
    !isFieldInputOnly && !isReadOnly && !(isMobile && isFirstColumn);

  return (
    <StyledRecordTableCellHoveredPortalContent isReadOnly={isReadOnly}>
      {isInEditMode ? (
        <RecordTableCellEditMode>
          <RecordTableCellFieldInput />
        </RecordTableCellEditMode>
      ) : (
        <>
          <RecordTableCellDisplayMode>
            <FieldDisplay />
          </RecordTableCellDisplayMode>
          {showButton && <RecordTableCellEditButton />}
        </>
      )}
    </StyledRecordTableCellHoveredPortalContent>
  );
};
