import { type MouseEvent } from 'react';

import { LinkType, RoundedLink, SocialLink } from 'twenty-ui/navigation';
import { checkUrlType } from '~/utils/checkUrlType';
import { EllipsisDisplay } from './EllipsisDisplay';

type URLDisplayProps = {
  value: string | null;
};

export const URLDisplay = ({ value }: URLDisplayProps) => {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const absoluteUrl = value
    ? value.startsWith('http')
      ? value
      : 'https://' + value
    : '';

  const displayedValue = value ?? '';

  const type = checkUrlType(absoluteUrl);

  if (
    type === LinkType.LinkedIn ||
    type === LinkType.Twitter ||
    type === LinkType.Facebook
  ) {
    return (
      <EllipsisDisplay>
        <SocialLink
          href={absoluteUrl}
          onClick={handleClick}
          type={type}
          label={displayedValue}
        />
      </EllipsisDisplay>
    );
  }
  return (
    <EllipsisDisplay>
      <RoundedLink
        href={absoluteUrl}
        onClick={handleClick}
        label={displayedValue}
      />
    </EllipsisDisplay>
  );
};
