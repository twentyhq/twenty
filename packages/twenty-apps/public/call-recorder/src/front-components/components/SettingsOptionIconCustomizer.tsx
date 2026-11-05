import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/icon';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

// SVG size attributes need numbers, not the var() strings theme tokens resolve to here.
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
    <Icon size={THEME_COMMON.icon.size.lg} stroke={THEME_COMMON.icon.stroke.md} />
  </StyledIconCustomizer>
);
