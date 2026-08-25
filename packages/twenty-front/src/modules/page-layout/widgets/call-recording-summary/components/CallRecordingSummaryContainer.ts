import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Same box as the note and task bodies: the left inset is the gutter BlockNote
// draws its drag handle and add-block button into.
export const StyledCallRecordingSummaryContainer = styled.div`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[6]};
  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;
`;
