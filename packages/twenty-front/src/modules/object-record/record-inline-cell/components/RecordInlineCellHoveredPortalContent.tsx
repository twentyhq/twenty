import { RecordInlineCellHoveredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortal';
import { css } from '@emotion/react';
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

  ${({ readonly }) =>
    !readonly &&
    css`
      cursor: pointer;
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
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
`;

type RecordInlineCellHoveredPortalContentProps = {
  children: React.ReactNode;
  readonly: boolean;
  isCentered?: boolean;
  onClick?: () => void;
  onMouseLeave?: () => void;
};

export const RecordInlineCellHoveredPortalContent = ({
  children,
  isCentered,
  readonly,
  onClick,
  onMouseLeave,
}: RecordInlineCellHoveredPortalContentProps) => {
  return (
    <RecordInlineCellHoveredPortal>
      <StyledInlineCellBaseContainer
        readonly={readonly}
        onClick={onClick}
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
