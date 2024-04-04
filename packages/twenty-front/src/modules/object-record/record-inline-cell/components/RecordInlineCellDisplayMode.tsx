import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledRecordInlineCellNormalModeOuterContainer = styled.div<
  Pick<
    RecordInlineCellDisplayModeProps,
    | 'isDisplayModeContentEmpty'
    | 'disableHoverEffect'
    | 'isDisplayModeFixHeight'
    | 'isHovered'
  >
>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ isDisplayModeFixHeight }) =>
    isDisplayModeFixHeight ? '16px' : 'auto'};
  min-height: 16px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};

  ${(props) => {
    if (props.isHovered === true) {
      return css`
        background-color: ${!props.disableHoverEffect
          ? props.theme.background.transparent.light
          : 'transparent'};

        cursor: pointer;
      `;
    }
  }}
`;

const StyledRecordInlineCellNormalModeInnerContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 'inherit';
  font-weight: 'inherit';

  height: fit-content;

  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyField = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

type RecordInlineCellDisplayModeProps = {
  isDisplayModeContentEmpty?: boolean;
  disableHoverEffect?: boolean;
  isDisplayModeFixHeight?: boolean;
  isHovered?: boolean;
  emptyPlaceholder?: string;
};

export const RecordInlineCellDisplayMode = ({
  children,
  isDisplayModeContentEmpty,
  disableHoverEffect,
  isDisplayModeFixHeight,
  emptyPlaceholder = 'Empty',
  isHovered,
}: React.PropsWithChildren<RecordInlineCellDisplayModeProps>) => (
  <StyledRecordInlineCellNormalModeOuterContainer
    isDisplayModeContentEmpty={isDisplayModeContentEmpty}
    disableHoverEffect={disableHoverEffect}
    isDisplayModeFixHeight={isDisplayModeFixHeight}
    isHovered={isHovered}
  >
    <StyledRecordInlineCellNormalModeInnerContainer>
      {isDisplayModeContentEmpty || !children ? (
        <StyledEmptyField>{emptyPlaceholder}</StyledEmptyField>
      ) : (
        children
      )}
    </StyledRecordInlineCellNormalModeInnerContainer>
  </StyledRecordInlineCellNormalModeOuterContainer>
);
