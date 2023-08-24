import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledEditableFieldNormalModeOuterContainer = styled.div<
  Pick<
    OwnProps,
    | 'disableClick'
    | 'isDisplayModeContentEmpty'
    | 'disableHoverEffect'
    | 'isDisplayModeFixHeight'
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
    if (!props.isDisplayModeContentEmpty) {
      return css`
        width: fit-content;
      `;
    }
  }}

  ${(props) => {
    if (props.disableClick) {
      return css`
        cursor: default;
      `;
    } else {
      return css`
        cursor: pointer;

        &:hover {
          background-color: ${!props.disableHoverEffect &&
          props.theme.background.transparent.lighter};
        }
      `;
    }
  }}
`;

const StyledEditableFieldNormalModeInnerContainer = styled.div`
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

type OwnProps = {
  disableClick?: boolean;
  onClick?: () => void;
  isDisplayModeContentEmpty?: boolean;
  disableHoverEffect?: boolean;
  isDisplayModeFixHeight?: boolean;
};

export function EditableFieldDisplayMode({
  children,
  disableClick,
  onClick,
  isDisplayModeContentEmpty,
  disableHoverEffect,
  isDisplayModeFixHeight,
}: React.PropsWithChildren<OwnProps>) {
  return (
    <StyledEditableFieldNormalModeOuterContainer
      onClick={disableClick ? undefined : onClick}
      disableClick={disableClick}
      isDisplayModeContentEmpty={isDisplayModeContentEmpty}
      disableHoverEffect={disableHoverEffect}
      isDisplayModeFixHeight={isDisplayModeFixHeight}
    >
      <StyledEditableFieldNormalModeInnerContainer>
        {isDisplayModeContentEmpty || !children ? (
          <StyledEmptyField>{'Empty'}</StyledEmptyField>
        ) : (
          children
        )}
      </StyledEditableFieldNormalModeInnerContainer>
    </StyledEditableFieldNormalModeOuterContainer>
  );
}
