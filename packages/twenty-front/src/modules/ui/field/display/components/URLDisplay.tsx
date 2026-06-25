import { type MouseEvent } from 'react';

import { RoundedLink, SocialLink } from 'twenty-ui/navigation';
import { checkUrlType } from '~/utils/checkUrlType';
import { isSocialLinkType } from '~/utils/isSocialLinkType';
import { getSafeUrl } from 'twenty-shared/utils';
import { EllipsisDisplay } from 'twenty-ui/data-display';

type URLDisplayProps = {
  value: string | null;
};

export const URLDisplay = ({ value }: URLDisplayProps) => {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const absoluteUrl = value ? (getSafeUrl(value) ?? '') : '';

  const displayedValue = value ?? '';

  const type = checkUrlType(absoluteUrl);

  if (isSocialLinkType(type)) {
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
