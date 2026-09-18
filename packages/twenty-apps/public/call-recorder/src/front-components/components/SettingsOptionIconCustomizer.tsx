import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
    <Icon
      style={{
        width: `calc(${themeCssVariables.icon.size.lg} * 1px)`,
        height: `calc(${themeCssVariables.icon.size.lg} * 1px)`,
        strokeWidth: themeCssVariables.icon.stroke.md,
      }}
    />
  </StyledIconCustomizer>
);
