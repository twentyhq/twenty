import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useIsFieldEmpty } from '@/object-record/record-field/ui/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import {
  useRecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellButton } from '@/object-record/record-inline-cell/components/RecordInlineCellEditButton';
import { useLingui } from '@lingui/react/macro';

const StyledRecordInlineCellNormalModeOuterContainer = styled.div<
  Pick<
    RecordInlineCellContextProps,
    'isDisplayModeFixHeight' | 'disableHoverEffect'
  > & { isHovered?: boolean }
>`
  outline: 1px solid
    ${({ theme, isHovered }) =>
      isHovered ? theme.border.color.medium : 'transparent'};
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
  height: fit-content;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  padding-top: 2px;
  padding-bottom: 2px;
`;

const StyledEmptyField = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 20px;
`;

export const RecordInlineCellDisplayMode = ({
  children,
  isHovered,
}: React.PropsWithChildren<{ isHovered: boolean }>) => {
  const { t } = useLingui();

  const { editModeContentOnly, showLabel, label, buttonIcon } =
    useRecordInlineCellContext();

  const isDisplayModeContentEmpty = useIsFieldEmpty();
  const showEditButton =
    buttonIcon &&
    isHovered &&
    !isDisplayModeContentEmpty &&
    !editModeContentOnly;

  const isFieldInputOnly = useIsFieldInputOnly();

  const shouldDisplayEditModeOnFocus = isHovered && isFieldInputOnly;

  const emptyPlaceHolder = showLabel ? t`Empty` : label;

  return (
    <>
      <StyledRecordInlineCellNormalModeOuterContainer isHovered={isHovered}>
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
