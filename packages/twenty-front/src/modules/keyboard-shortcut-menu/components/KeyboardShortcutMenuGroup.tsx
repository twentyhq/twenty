import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { Heading } from 'twenty-ui/primitives/typography';

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-2);
`;

type KeyboardMenuGroupProps = {
  heading: string;
  children: ReactNode;
};

export const KeyboardMenuGroup = ({
  heading,
  children,
}: KeyboardMenuGroupProps) => {
  const headingId = useId();

  return (
    <StyledGroup role="group" aria-labelledby={headingId}>
      <Heading id={headingId} level={3} size="md" color="tertiary">
        {heading}
      </Heading>
      {children}
    </StyledGroup>
  );
};
