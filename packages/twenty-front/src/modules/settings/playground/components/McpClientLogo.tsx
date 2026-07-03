import { styled } from '@linaria/react';

import { IconModelClaude, IconProviderOpenai } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

const StyledLogoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;

  .dark &.dark-mode-invert {
    filter: invert(1);
  }
`;

const StyledOpenAiLogo = styled.div`
  display: flex;
  height: 100%;
  width: 100%;

  > svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;

type McpClientLogoProps = {
  invertInDarkMode?: boolean;
  src: string;
};

export const McpClientLogo = ({
  invertInDarkMode = false,
  src,
}: McpClientLogoProps) => (
  <StyledLogoImage
    src={src}
    alt=""
    className={invertInDarkMode ? 'dark-mode-invert' : undefined}
  />
);

export const McpClaudeLogo = () => {
  const theme = useTheme();

  return <IconModelClaude size={theme.icon.size.xl} />;
};

export const McpOpenAiLogo = () => (
  <StyledOpenAiLogo>
    <IconProviderOpenai />
  </StyledOpenAiLogo>
);
