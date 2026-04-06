import { RecordInlineCellHoveredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortal';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
  isDisabled?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: ${({ isCentered }) =>
    isCentered === true ? 'center' : 'normal'};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};

  width: 100%;
`;

const StyledInlineCellBaseContainer = styled.div<{ readonly: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: fit-content;
  user-select: none;
  width: 100%;
`;

type RecordInlineCellHoveredPortalContentProps = {
  children: React.ReactNode;
  readonly: boolean;
  isCentered?: boolean;
  isDisabled?: boolean;
  onMouseLeave?: () => void;
};

export const RecordInlineCellHoveredPortalContent = ({
  children,
  isCentered,
  isDisabled,
  readonly,
  onMouseLeave,
}: RecordInlineCellHoveredPortalContentProps) => {
  return (
    <RecordInlineCellHoveredPortal>
      <StyledInlineCellBaseContainer
        readonly={readonly}
        onMouseLeave={onMouseLeave}
      >
        <StyledRecordTableCellHoveredPortalContent
          isCentered={isCentered}
          isDisabled={isDisabled}
          readonly={readonly}
        >
          {children}
        </StyledRecordTableCellHoveredPortalContent>
      </StyledInlineCellBaseContainer>
    </RecordInlineCellHoveredPortal>
  );
};
