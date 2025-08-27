import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/display';

type SettingsOptionIconCustomizerProps = {
  Icon: IconComponent;
  zoom?: number;
  rotate?: number;
};

const StyledIconCustomizer = styled.div<{ zoom: number; rotate: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: scale(${({ zoom }) => zoom}) rotate(${({ rotate }) => rotate}deg);
`;

export const SettingsOptionIconCustomizer = ({
  Icon,
  zoom = 1,
  rotate = -4,
}: SettingsOptionIconCustomizerProps) => {
  const theme = useTheme();
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
