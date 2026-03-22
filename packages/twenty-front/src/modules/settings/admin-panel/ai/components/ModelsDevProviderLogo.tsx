import { styled } from '@linaria/react';
import { type IconComponentProps } from 'twenty-ui/display';

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
  const pixelSize = resolvePixelSize(size);

  return (
    <StyledLogo
      alt=""
      className={className}
      height={pixelSize}
      src={logoUrl}
      style={style}
      width={pixelSize}
    />
  );
};
