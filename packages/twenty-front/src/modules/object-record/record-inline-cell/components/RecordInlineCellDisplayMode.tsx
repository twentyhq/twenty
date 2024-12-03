import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import {
  RecordInlineCellContextProps,
  useRecordInlineCellContext,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellButton } from '@/object-record/record-inline-cell/components/RecordInlineCellEditButton';

const StyledRecordInlineCellNormalModeOuterContainer = styled.div<
  Pick<
    RecordInlineCellContextProps,
    'isDisplayModeFixHeight' | 'disableHoverEffect'
  > & { isHovered?: boolean }
>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ isDisplayModeFixHeight }) =>
    isDisplayModeFixHeight ? '16px' : 'auto'};
  min-height: 16px;
  overflow: hidden;
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
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
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  padding-top: 3px;
  padding-bottom: 3px;

  height: fit-content;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyField = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

export const RecordInlineCellDisplayMode = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const { isFocused } = useFieldFocus();

  const {
    editModeContentOnly,

    showLabel,
    label,
    buttonIcon,
  } = useRecordInlineCellContext();

  const isDisplayModeContentEmpty = useIsFieldEmpty();
  const showEditButton =
    buttonIcon &&
    isFocused &&
    !isDisplayModeContentEmpty &&
    !editModeContentOnly;

  const isFieldInputOnly = useIsFieldInputOnly();

  const shouldDisplayEditModeOnFocus = isFocused && isFieldInputOnly;

  const emptyPlaceHolder = showLabel ? 'Empty' : label;

  return (
    <>
      <StyledRecordInlineCellNormalModeOuterContainer isHovered={isFocused}>
        <StyledRecordInlineCellNormalModeInnerContainer>
          {(isDisplayModeContentEmpty && !shouldDisplayEditModeOnFocus) ||
          !children ? (
            <StyledEmptyField>{emptyPlaceHolder}</StyledEmptyField>
          ) : (
            children
          )}
        </StyledRecordInlineCellNormalModeInnerContainer>
      </StyledRecordInlineCellNormalModeOuterContainer>
      {showEditButton && <RecordInlineCellButton Icon={buttonIcon} />}
    </>
  );
};
