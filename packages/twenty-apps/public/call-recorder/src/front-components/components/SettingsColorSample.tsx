import styled from '@emotion/styled';
import { ColorSample, type ColorSampleProps } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsColorSampleProps = Omit<ColorSampleProps, 'variant'>;

// The front-component style bridge does not preserve ColorSample's pill radius.
const StyledContainer = styled.span`
  display: flex;

  > div {
    border-radius: ${() => themeCssVariables.border.radius.pill};
    corner-shape: round;
  }
`;

export const SettingsColorSample = (props: SettingsColorSampleProps) => (
  <StyledContainer>
    <ColorSample {...props} />
  </StyledContainer>
);
