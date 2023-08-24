import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledEditableFieldNormalModeOuterContainer = styled.div<
  Pick<
    OwnProps,
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
    if (!props.isDisplayModeContentEmpty) {
      return css`
        width: fit-content;
      `;
    }
  }}

  ${(props) => {
    if (props.isHovered) {
      return css`
        background-color: ${!props.disableHoverEffect &&
        props.theme.background.transparent.lighter};

        cursor: pointer;
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
  isDisplayModeContentEmpty?: boolean;
  disableHoverEffect?: boolean;
  isDisplayModeFixHeight?: boolean;
  isHovered?: boolean;
};

export function EditableFieldDisplayMode({
  children,
  isDisplayModeContentEmpty,
  disableHoverEffect,
  isDisplayModeFixHeight,
  isHovered,
}: React.PropsWithChildren<OwnProps>) {
  return (
    <StyledEditableFieldNormalModeOuterContainer
      isDisplayModeContentEmpty={isDisplayModeContentEmpty}
      disableHoverEffect={disableHoverEffect}
      isDisplayModeFixHeight={isDisplayModeFixHeight}
      isHovered={isHovered}
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
