import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledColumnSpacer = styled.div<{ hasBottomBorder: boolean }>`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: ${({ hasBottomBorder }) =>
    hasBottomBorder
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};
  flex-shrink: 0;
`;

export const RecordTableColumnSpacer = ({
  width,
  hasBottomBorder = false,
}: {
  width: number;
  hasBottomBorder?: boolean;
}) => (
  <StyledColumnSpacer hasBottomBorder={hasBottomBorder} style={{ width }} />
);
