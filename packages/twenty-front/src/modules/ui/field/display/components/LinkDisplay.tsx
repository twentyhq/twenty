import { MouseEvent } from 'react';

import { FieldLinkValue } from '@/object-record/record-field/types/FieldMetadata';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink';
import {
  LinkType,
  SocialLink,
} from '@/ui/navigation/link/components/SocialLink';
import { checkUrlType } from '~/utils/checkUrlType';
import { getAbsoluteUrl } from '~/utils/url/getAbsoluteUrl';
import { getUrlHostName } from '~/utils/url/getUrlHostName';

type LinkDisplayProps = {
  value?: FieldLinkValue;
};

export const LinkDisplay = ({ value }: LinkDisplayProps) => {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const absoluteUrl = getAbsoluteUrl(value?.url || '');
  const displayedValue = value?.label || getUrlHostName(absoluteUrl);
  const type = checkUrlType(absoluteUrl);

  if (type === LinkType.LinkedIn || type === LinkType.Twitter) {
    return (
      <SocialLink href={absoluteUrl} onClick={handleClick} type={type}>
        {displayedValue}
      </SocialLink>
    );
  }

  return (
    <RoundedLink href={absoluteUrl} onClick={handleClick}>
      {displayedValue}
    </RoundedLink>
  );
};
