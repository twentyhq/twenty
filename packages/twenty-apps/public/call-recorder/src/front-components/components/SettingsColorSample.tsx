import styled from '@emotion/styled';
import { ColorSample, type ColorSampleProps } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.span`
  display: flex;

  > div {
    border-radius: ${() => themeCssVariables.border.radius.pill};
    corner-shape: round;
  }
`;

export const SettingsColorSample = (props: ColorSampleProps) => (
  <StyledContainer>
    <ColorSample {...props} />
  </StyledContainer>
);
