import {
  type LinkType,
  SOCIAL_LINK_PROVIDERS,
} from 'twenty-ui/primitives/navigation';

export const isSocialLinkType = (type: LinkType): boolean =>
  SOCIAL_LINK_PROVIDERS.some(
    (socialLinkProvider) => socialLinkProvider.type === type,
  );
