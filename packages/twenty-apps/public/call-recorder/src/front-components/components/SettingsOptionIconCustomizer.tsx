import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// twenty-front reads these off ThemeContext, but a front component has no
// ThemeProvider: the context default resolves every value to a var() string,
// which an SVG size attribute cannot use. Sizes come from the numeric ICON
// constants and the colour is inherited through currentColor instead.
const StyledIconCustomizer = styled.div<{ $zoom: number; $rotate: number }>`
  align-items: center;
  color: ${() => themeCssVariables.IllustrationIcon.color.gray};
  display: inline-flex;
  justify-content: center;
  pointer-events: none;
  transform: ${({ $zoom, $rotate }) => `scale(${$zoom}) rotate(${$rotate}deg)`};
`;

type SettingsOptionIconCustomizerProps = {
  Icon: IconComponent;
  zoom?: number;
  rotate?: number;
};

export const SettingsOptionIconCustomizer = ({
  Icon,
  zoom = 1,
  rotate = -4,
}: SettingsOptionIconCustomizerProps) => (
  <StyledIconCustomizer $zoom={zoom} $rotate={rotate}>
    <Icon size={ICON.size.lg} stroke={ICON.stroke.md} />
  </StyledIconCustomizer>
);
