import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Mirrors Twenty's ActivityRow: 48px rows with 16px side padding.
export const StyledCallRecordingRowLayout = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  height: ${() => themeCssVariables.spacing[12]};
  padding: 0 ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;
