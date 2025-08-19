import { RecordInlineCellHoveredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortal';
import styled from '@emotion/styled';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  ${({ isCentered }) =>
    isCentered === true &&
    `
      justify-content: center;
    `};
`;

const StyledInlineCellBaseContainer = styled.div<{ readonly: boolean }>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  height: fit-content;
  gap: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  align-items: center;
`;

type RecordInlineCellHoveredPortalContentProps = {
  children: React.ReactNode;
  readonly: boolean;
  isCentered?: boolean;
  onMouseLeave?: () => void;
};

export const RecordInlineCellHoveredPortalContent = ({
  children,
  isCentered,
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
          readonly={readonly}
        >
          {children}
        </StyledRecordTableCellHoveredPortalContent>
      </StyledInlineCellBaseContainer>
    </RecordInlineCellHoveredPortal>
  );
};
