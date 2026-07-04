import { styled } from '@linaria/react';

import { useThemeColorScheme } from 'twenty-ui/theme-constants';

const StyledLogoImage = styled.img<{ isInverted: boolean }>`
  display: block;
  filter: ${({ isInverted }) => (isInverted ? 'invert(1)' : 'none')};
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

type McpClientLogoProps = {
  invertInDarkMode?: boolean;
  src: string;
};

export const McpClientLogo = ({
  invertInDarkMode = false,
  src,
}: McpClientLogoProps) => {
  const colorScheme = useThemeColorScheme();

  return (
    <StyledLogoImage
      src={src}
      alt=""
      isInverted={invertInDarkMode && colorScheme === 'dark'}
    />
  );
};
