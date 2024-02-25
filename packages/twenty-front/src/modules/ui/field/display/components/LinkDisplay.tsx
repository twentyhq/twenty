import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { FieldLinkValue } from '@/object-record/record-field/types/FieldMetadata';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink';
import {
  LinkType,
  SocialLink,
} from '@/ui/navigation/link/components/SocialLink';
import { checkUrlType } from '~/utils/checkUrlType';

import { EllipsisDisplay } from './EllipsisDisplay';

const StyledRawLink = styled(RoundedLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type LinkDisplayProps = {
  value?: FieldLinkValue;
};

export const LinkDisplay = ({ value }: LinkDisplayProps) => {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const absoluteUrl = value?.url
    ? value.url.startsWith('http')
      ? value.url
      : 'https://' + value.url
    : '';

  const displayedValue = value?.label || value?.url || '';

  const type = checkUrlType(absoluteUrl);

  if (type === LinkType.LinkedIn || type === LinkType.Twitter) {
    return (
      <EllipsisDisplay>
        <SocialLink href={absoluteUrl} onClick={handleClick} type={type}>
          {displayedValue}
        </SocialLink>
      </EllipsisDisplay>
    );
  }
  return (
    <EllipsisDisplay>
      <StyledRawLink href={absoluteUrl} onClick={handleClick}>
        {displayedValue}
      </StyledRawLink>
    </EllipsisDisplay>
  );
};
