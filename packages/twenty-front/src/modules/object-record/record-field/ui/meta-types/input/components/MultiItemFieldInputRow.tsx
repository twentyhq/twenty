import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const COMPACT_ROW_HEIGHT = themeCssVariables.spacing[8];
const COMPACT_ROW_WITH_PADDING_HEIGHT = `calc(${themeCssVariables.spacing[8]} + 2 * ${themeCssVariables.spacing[1]})`;

const getInputRowHeight = ({
  spacing,
  hasPadding,
}: {
  spacing: MultiItemFieldInputSpacing;
  hasPadding: boolean;
}) => {
  if (spacing === 'default') {
    return 'auto';
  }

  return hasPadding ? COMPACT_ROW_WITH_PADDING_HEIGHT : COMPACT_ROW_HEIGHT;
};

const StyledInputRow = styled.div<{
  spacing: MultiItemFieldInputSpacing;
  hasPadding: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${({ spacing }) =>
    spacing === 'compact' ? themeCssVariables.spacing[1] : '0'};
  height: ${getInputRowHeight};
  min-height: ${themeCssVariables.spacing[8]};
  padding: ${({ hasPadding }) =>
    hasPadding ? themeCssVariables.spacing[1] : '0'};
  width: 100%;
`;

const StyledRightContainer = styled.div<{
  spacing: MultiItemFieldInputSpacing;
}>`
  display: flex;
  flex-shrink: 0;
  padding-inline-end: ${({ spacing }) =>
    spacing === 'compact'
      ? themeCssVariables.spacing[1]
      : themeCssVariables.spacing[2]};
`;

type MultiItemFieldInputRowProps = {
  children: ReactNode;
  rightComponent?: ReactNode;
  spacing?: MultiItemFieldInputSpacing;
  hasPadding?: boolean;
};

export const MultiItemFieldInputRow = ({
  children,
  rightComponent,
  spacing = 'default',
  hasPadding = false,
}: MultiItemFieldInputRowProps) => (
  <StyledInputRow spacing={spacing} hasPadding={hasPadding}>
    {children}
    {isDefined(rightComponent) && (
      <StyledRightContainer spacing={spacing}>
        {rightComponent}
      </StyledRightContainer>
    )}
  </StyledInputRow>
);
