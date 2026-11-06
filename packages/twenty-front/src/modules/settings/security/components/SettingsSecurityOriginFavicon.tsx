import { getLogoUrlFromDomainName, normalizeDomain } from 'twenty-shared/utils';
import { IconWorld } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

type SettingsSecurityOriginFaviconProps = {
  origin: string;
};

export const SettingsSecurityOriginFavicon = ({
  origin,
}: SettingsSecurityOriginFaviconProps) => {
  const theme = useTheme();

  return (
    <Avatar.Root
      size="md"
      shape="square"
      backgroundColor="transparent"
      aria-hidden
    >
      <Avatar.Image
        src={getLogoUrlFromDomainName(normalizeDomain(origin))}
        alt=""
      />
      <Avatar.Fallback render={<IconWorld size={theme.icon.size.md} />} />
    </Avatar.Root>
  );
};
