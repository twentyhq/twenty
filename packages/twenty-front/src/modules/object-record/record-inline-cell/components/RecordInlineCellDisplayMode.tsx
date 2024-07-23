import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellButton } from '@/object-record/record-inline-cell/components/RecordInlineCellEditButton';

const StyledRecordInlineCellNormalModeOuterContainer = styled.div<
  Pick<
    RecordInlineCellDisplayModeProps,
    'disableHoverEffect' | 'isDisplayModeFixHeight' | 'isHovered'
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
  disableHoverEffect?: boolean;
  isDisplayModeFixHeight?: boolean;
  isHovered?: boolean;
  emptyPlaceholder?: string;
}

export const RecordInlineCellDisplayMode = ({
  children,
  emptyPlaceholder = 'Empty',
  isHovered,
}: React.PropsWithChildren<RecordInlineCellDisplayModeProps>) => {
  const { buttonIcon, editModeContentOnly, disableHoverEffect, isDisplayModeFixHeight } = useRecordInlineCellContext();
  const { isFocused } = useFieldFocus();
  const isDisplayModeContentEmpty = useIsFieldEmpty();
  const showEditButton =
    buttonIcon &&
    isFocused &&
    !isDisplayModeContentEmpty &&
    !editModeContentOnly;

  const isFieldInputOnly = useIsFieldInputOnly();

  const shouldDisplayEditModeOnFocus = isFocused && isFieldInputOnly;

  return (
    <>
      <StyledRecordInlineCellNormalModeOuterContainer
        disableHoverEffect={disableHoverEffect}
        isDisplayModeFixHeight={isDisplayModeFixHeight}
        isHovered={isHovered}
      >
        <StyledRecordInlineCellNormalModeInnerContainer>
          {(isDisplayModeContentEmpty && !shouldDisplayEditModeOnFocus) ||
          !children ? (
            <StyledEmptyField>{emptyPlaceholder}</StyledEmptyField>
          ) : (
            children
          )}
        </StyledRecordInlineCellNormalModeInnerContainer>
      </StyledRecordInlineCellNormalModeOuterContainer>
      {showEditButton && <RecordInlineCellButton Icon={buttonIcon} />}
    </>
  );
};
