import { type LinkType } from '@/ui/field/display/components/SocialLink/LinkType';
import { SOCIAL_LINK_PROVIDERS } from '@/ui/field/display/components/SocialLink/socialLinkProviders';
import { isDefined } from 'twenty-ui/utilities';

type GetDisplayValueByUrlTypeProps = {
  type: LinkType;
  href: string;
};

export const getDisplayValueByUrlType = ({
  type,
  href,
}: GetDisplayValueByUrlTypeProps) => {
  const provider = SOCIAL_LINK_PROVIDERS.find(
    (socialLinkProvider) => socialLinkProvider.type === type,
  );

  if (!isDefined(provider)) {
    return undefined;
  }

  const handle = href.match(provider.handlePattern)?.[1];

  if (
    !isDefined(handle) ||
    provider.reservedPaths.includes(handle.toLowerCase())
  ) {
    return provider.fallbackLabel;
  }

  return `${provider.handlePrefix}${decodeURIComponent(handle)}`;
};
