import styled from '@emotion/styled';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

// Sizing (height, min-height) is intentionally left to the caller's layout.
export const CenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${recordingThemeCssVariables.font.colorTertiary};
  display: flex;
  font-family: ${recordingThemeCssVariables.font.family};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  justify-content: center;
  padding: ${recordingThemeCssVariables.spacing[4]};
`;
