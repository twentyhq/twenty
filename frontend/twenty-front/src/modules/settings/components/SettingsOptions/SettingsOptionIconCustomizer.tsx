import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';

type SettingsOptionIconCustomizerProps = {
  Icon: IconComponent;
  zoom?: number;
  rotate?: number;
};

const StyledIconCustomizer = styled.div<{ zoom: number; rotate: number }>`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  transform: scale(${({ zoom }) => zoom}) rotate(${({ rotate }) => rotate}deg);
`;

export const SettingsOptionIconCustomizer = ({
  Icon,
  zoom = 1,
  rotate = -4,
}: SettingsOptionIconCustomizerProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledIconCustomizer zoom={zoom} rotate={rotate}>
      <Icon
        size={theme.icon.size.lg}
        color={theme.IllustrationIcon.color.gray}
        stroke={theme.icon.stroke.md}
      />
    </StyledIconCustomizer>
  );
};
