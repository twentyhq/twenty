import { LinkType, SOCIAL_LINK_PROVIDERS } from 'twenty-ui/navigation';

export const checkUrlType = (url: string) => {
  const provider = SOCIAL_LINK_PROVIDERS.find((socialLinkProvider) =>
    socialLinkProvider.detectPattern.test(url),
  );

  return provider?.type ?? LinkType.Url;
};
