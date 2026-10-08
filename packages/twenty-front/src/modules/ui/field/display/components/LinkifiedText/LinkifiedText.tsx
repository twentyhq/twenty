import { isNonEmptyString } from '@sniptt/guards';

import { styled } from '@linaria/react';
import { getSafeUrl } from 'twenty-shared/utils';
import { linkifyText } from './linkifyText';

const StyledLink = styled.a`
  color: var(--t-color-blue);
  text-decoration: underline;

  &:hover {
    text-decoration-color: var(--t-color-blue);
  }
`;

type LinkifiedTextProps = {
  text: string;
};

export const LinkifiedText = ({ text }: LinkifiedTextProps) => {
  if (!isNonEmptyString(text)) {
    return null;
  }

  return (
    <>
      {linkifyText(text).map((part, index) =>
        part.type === 'link' ? (
          <StyledLink
            key={index}
            href={getSafeUrl(part.content)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {part.content}
          </StyledLink>
        ) : (
          part.content
        ),
      )}
    </>
  );
};
