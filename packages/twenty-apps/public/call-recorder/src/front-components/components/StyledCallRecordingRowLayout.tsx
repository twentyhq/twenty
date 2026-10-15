import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledCallRecordingRowLayout = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  height: ${() => themeCssVariables.spacing[12]};
  padding: 0 ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;
