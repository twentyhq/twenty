import { LinkType } from '@/ui/field/display/components/SocialLink/LinkType';
import { SOCIAL_LINK_PROVIDERS } from '@/ui/field/display/components/SocialLink/socialLinkProviders';

export const checkUrlType = (url: string) => {
  const provider = SOCIAL_LINK_PROVIDERS.find((socialLinkProvider) =>
    socialLinkProvider.detectPattern.test(url),
  );

  return provider?.type ?? LinkType.Url;
};
