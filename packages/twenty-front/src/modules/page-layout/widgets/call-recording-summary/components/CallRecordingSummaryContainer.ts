import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The left inset is the gutter BlockNote draws its drag handle and add-block
// button into, as on the note and task bodies. No top margin: unlike those, the
// summary sits under a widget header that already separates it.
export const StyledCallRecordingSummaryContainer = styled.div`
  box-sizing: border-box;
  padding-left: ${themeCssVariables.spacing[6]};
  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;

  // Summaries open on a heading, and BlockNote pads heading blocks; only the
  // leading one is trimmed, so the rest of the rhythm stays as everywhere else.
  &
    .bn-editor
    > .bn-block-group
    > .bn-block-outer:first-child
    .bn-block-content {
    padding-top: 0;
  }
`;
