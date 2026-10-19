import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { FIELD_DISPLAY_LEADING_ICON_CLASS_NAME } from '@/ui/field/display/constants/FieldDisplayLeadingIconClassName';

const StyledCardBodyContainer = styled.div<{ padding?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${({ padding }) =>
    padding ??
    `0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} 10px`};

  .${FIELD_DISPLAY_LEADING_ICON_CLASS_NAME} {
    margin-right: ${themeCssVariables.spacing[2]};
  }
`;

export { StyledCardBodyContainer as RecordCardBodyContainer };
