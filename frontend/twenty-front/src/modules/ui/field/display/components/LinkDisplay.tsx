import { isNonEmptyString } from '@sniptt/guards';
import { LinkType, RoundedLink, SocialLink } from 'twenty-ui/navigation';
import { checkUrlType } from '~/utils/checkUrlType';

type LinkDisplayProps = {
  value: { url: string; label?: string | null };
};

export const LinkDisplay = ({ value }: LinkDisplayProps) => {
  const url = value.url;

  if (!isNonEmptyString(url)) {
    return <></>;
  }

  const absoluteUrl = url
    ? url.startsWith('http')
      ? url
      : 'https://' + url
    : '';

  const displayedValue = isNonEmptyString(value.label)
    ? value.label
    : url?.replace(/^http[s]?:\/\/(?:[w]+\.)?/gm, '').replace(/^[w]+\./gm, '');

  const type = checkUrlType(absoluteUrl);

  if (
    type === LinkType.LinkedIn ||
    type === LinkType.Twitter ||
    type === LinkType.Facebook
  ) {
    return <SocialLink href={absoluteUrl} type={type} label={displayedValue} />;
  }

  return <RoundedLink href={absoluteUrl} label={displayedValue} />;
};
