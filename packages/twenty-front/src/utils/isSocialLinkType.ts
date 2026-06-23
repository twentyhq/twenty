import { LinkType } from 'twenty-ui/navigation';

// Link types rendered as a social handle (via SocialLink) instead of a plain RoundedLink
const SOCIAL_LINK_TYPES = [
  LinkType.LinkedIn,
  LinkType.Twitter,
  LinkType.Facebook,
  LinkType.Instagram,
];

export const isSocialLinkType = (type: LinkType): boolean =>
  SOCIAL_LINK_TYPES.includes(type);
