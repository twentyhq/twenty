import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledCallRecordingSummaryContainer = styled.div`
  box-sizing: border-box;
  padding-left: ${themeCssVariables.spacing[6]};
  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;

  &
    .bn-editor
    > .bn-block-group
    > .bn-block-outer:first-child
    .bn-block-content {
    padding-top: 0;
  }
`;
