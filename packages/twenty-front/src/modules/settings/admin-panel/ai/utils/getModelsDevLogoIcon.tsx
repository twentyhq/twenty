import { type IconComponent, type IconComponentProps } from 'twenty-ui/display';

import { ModelsDevProviderLogo } from '@/settings/admin-panel/ai/components/ModelsDevProviderLogo';

const MODELS_DEV_LOGO_BASE = 'https://models.dev/logos';

const logoIconCache = new Map<string, IconComponent>();

type LogoIconProps = IconComponentProps;

export const getModelsDevLogoIcon = (providerId: string): IconComponent => {
  const cached = logoIconCache.get(providerId);

  if (cached) {
    return cached;
  }

  const logoUrl = `${MODELS_DEV_LOGO_BASE}/${providerId}.svg`;

  const LogoIcon = ({ size = 16, className, style }: LogoIconProps) => (
    <ModelsDevProviderLogo
      className={className}
      logoUrl={logoUrl}
      size={size}
      style={style}
    />
  );

  LogoIcon.displayName = `ModelsDevLogo(${providerId})`;

  logoIconCache.set(providerId, LogoIcon);

  return LogoIcon;
};
