import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';

import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 18px;
  padding-top: 3px;
`;

const StyledValueContainer = styled.div`
  display: flex;
  flex-grow: 1;
  min-width: 0;
  position: relative;
`;

const StyledLabelContainer = styled.div<{ width?: number }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  width: ${({ width }) => width}px;
`;

const StyledInlineCellBaseContainer = styled.div<{
  isDisplayModeFixHeight?: boolean;
}>`
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  height: fit-content;
  line-height: ${({ isDisplayModeFixHeight }) =>
    isDisplayModeFixHeight ? `24px` : `18px`};
  gap: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  justify-content: center;
`;

export const StyledSkeletonDiv = styled.div`
  height: 24px;
`;

export const RecordInlineCellContainer = () => {
  const {
    readonly,
    IconLabel,
    label,
    labelWidth,
    showLabel,
    isDisplayModeFixHeight,
  } = useRecordInlineCellContext();

  const { recordId, fieldDefinition } = useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.Text, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
  };

  const theme = useTheme();
  const labelId = `label-${getRecordFieldInputId(
    recordId,
    fieldDefinition?.metadata?.fieldName,
  )}`;

  return (
    <StyledInlineCellBaseContainer
      isDisplayModeFixHeight={isDisplayModeFixHeight}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(IconLabel || label) && (
        <StyledLabelAndIconContainer id={labelId}>
          {IconLabel && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {showLabel && label && (
            <StyledLabelContainer width={labelWidth}>
              <OverflowingTextWithTooltip text={label} displayedMaxRows={1} />
            </StyledLabelContainer>
          )}
          {/* TODO: Displaying Tooltips on the board is causing performance issues https://react-tooltip.com/docs/examples/render */}
          {!showLabel && !fieldDefinition?.disableTooltip && (
            <AppTooltip
              anchorSelect={`#${labelId}`}
              content={label}
              clickable
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </StyledLabelAndIconContainer>
      )}
      <StyledValueContainer>
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
