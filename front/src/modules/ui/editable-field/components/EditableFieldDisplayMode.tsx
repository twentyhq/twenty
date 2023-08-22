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
    if (props.isDisplayModeContentEmpty) {
      return css`
        min-width: 50px;
      `;
    } else {
      return css`
        width: 100%;
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
          props.theme.background.transparent.light};
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
  width: 100%;
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
        {children}
      </StyledEditableFieldNormalModeInnerContainer>
    </StyledEditableFieldNormalModeOuterContainer>
  );
}
