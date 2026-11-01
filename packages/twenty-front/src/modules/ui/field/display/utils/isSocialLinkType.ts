import { type LinkType } from '@/ui/field/display/components/SocialLink/LinkType';
import { SOCIAL_LINK_PROVIDERS } from '@/ui/field/display/components/SocialLink/socialLinkProviders';

export const isSocialLinkType = (type: LinkType): boolean =>
  SOCIAL_LINK_PROVIDERS.some(
    (socialLinkProvider) => socialLinkProvider.type === type,
  );
