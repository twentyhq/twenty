import { styled } from '@linaria/react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldEmpty } from '@/object-record/record-field/ui/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import {
  useRecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellButton } from '@/object-record/record-inline-cell/components/RecordInlineCellEditButton';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordInlineCellNormalModeOuterContainer = styled.div<
  Pick<
    RecordInlineCellContextProps,
    'isDisplayModeFixHeight' | 'disableHoverEffect' | 'readonly'
  > & { isHovered?: boolean }
>`
  outline: 1px solid
    ${({ isHovered, readonly }) =>
      isHovered && readonly
        ? themeCssVariables.border.color.medium
        : 'transparent'};
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${({ isDisplayModeFixHeight }) =>
    isDisplayModeFixHeight ? '16px' : 'auto'};
  min-height: 16px;
  overflow: hidden;
  padding-right: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  background-color: ${({ isHovered, readonly, disableHoverEffect }) =>
    isHovered && !readonly && !disableHoverEffect
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  cursor: ${({ isHovered, readonly }) =>
    isHovered && !readonly ? 'pointer' : 'default'};
`;

const StyledRecordInlineCellNormalModeInnerContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  height: fit-content;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  padding-top: 2px;
  padding-bottom: 2px;
`;

const StyledEmptyField = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  height: 20px;
`;

export const RecordInlineCellDisplayMode = ({
  children,
  onClick,
  isHovered,
}: React.PropsWithChildren<{
  isHovered: boolean;
  onClick?: () => void;
}>) => {
  const { t } = useLingui();

  const { editModeContentOnly, label, buttonIcon, readonly } =
    useRecordInlineCellContext();

  const { isForbidden } = useContext(FieldContext);

  const isFieldEmpty = useIsFieldEmpty();
  const showEditButton =
    buttonIcon &&
    isHovered &&
    !readonly &&
    !isFieldEmpty &&
    !editModeContentOnly;

  const isFieldInputOnly = useIsFieldInputOnly();

  const emptyPlaceHolder = label ?? t`Empty`;

  const shouldShowValue = !isFieldEmpty || isFieldInputOnly || isForbidden;

  const shouldShowEmptyPlaceholder = isFieldEmpty && !isForbidden;

  return (
    <>
      <StyledRecordInlineCellNormalModeOuterContainer
        isHovered={isHovered}
        readonly={readonly}
        onClick={onClick}
      >
        <StyledRecordInlineCellNormalModeInnerContainer>
          {shouldShowValue ? (
            children
          ) : shouldShowEmptyPlaceholder ? (
            <StyledEmptyField>{emptyPlaceHolder}</StyledEmptyField>
          ) : null}
        </StyledRecordInlineCellNormalModeInnerContainer>
      </StyledRecordInlineCellNormalModeOuterContainer>
      {showEditButton && (
        <RecordInlineCellButton Icon={buttonIcon} onClick={onClick} />
      )}
    </>
  );
};
