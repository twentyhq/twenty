import { type IconComponent } from 'twenty-ui/display';
import { createElement } from 'react';

const MODELS_DEV_LOGO_BASE = 'https://models.dev/logos';

type ModelsDevLogoProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

const iconCache = new Map<string, IconComponent>();

export const getModelsDevLogoIcon = (providerId: string): IconComponent => {
  const cached = iconCache.get(providerId);

  if (cached) {
    return cached;
  }

  const ModelsDevLogo = ({ size = 16, className, style }: ModelsDevLogoProps) =>
    createElement('img', {
      src: `${MODELS_DEV_LOGO_BASE}/${providerId}.svg`,
      alt: providerId,
      width: size,
      height: size,
      className,
      style: { ...style, objectFit: 'contain' as const },
    });

  ModelsDevLogo.displayName = `ModelsDevLogo(${providerId})`;

  iconCache.set(providerId, ModelsDevLogo as IconComponent);

  return ModelsDevLogo as IconComponent;
};
