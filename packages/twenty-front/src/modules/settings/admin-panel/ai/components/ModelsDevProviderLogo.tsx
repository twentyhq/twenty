import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponentProps } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';

type ModelsDevProviderLogoProps = {
  logoUrl: string;
} & Pick<IconComponentProps, 'className' | 'size' | 'style'>;

const resolvePixelSize = (
  size: IconComponentProps['size'] | undefined,
): number => {
  if (typeof size === 'number') {
    return size;
  }
  if (typeof size === 'string') {
    const parsed = parseInt(size, 10);

    return Number.isNaN(parsed) ? 16 : parsed;
  }

  return 16;
};

const StyledLogo = styled.img`
  object-fit: contain;
`;

export const ModelsDevProviderLogo = ({
  logoUrl,
  size,
  className,
  style,
}: ModelsDevProviderLogoProps) => {
  const { theme } = useContext(ThemeContext);
  const pixelSize = resolvePixelSize(size);
  const isLightTheme = theme.name === 'light';

  return (
    <StyledLogo
      alt=""
      className={className}
      height={pixelSize}
      src={logoUrl}
      style={{
        ...style,
        filter: isLightTheme ? 'none' : 'invert(1)',
      }}
      width={pixelSize}
    />
  );
};
