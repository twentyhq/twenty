import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Linkify from 'linkify-react';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

const StyledThreadMessageBody = styled(motion.div)`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(4)};
  white-space: pre-line;
  overflow-wrap: break-word;

  a {
    color: ${({ theme }) => theme.font.color.primary};

    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.font.color.primary};

    &:hover {
      color: ${({ theme }) => theme.font.color.tertiary};
      text-decoration-color: ${({ theme }) => theme.border.color.strong};
    }
  }
`;

type EmailThreadMessageBodyProps = {
  body: string;
  isDisplayed: boolean;
};

export const EmailThreadMessageBody = ({
  body,
  isDisplayed,
}: EmailThreadMessageBodyProps) => {
  return (
    <AnimatedEaseInOut isOpen={isDisplayed} duration="fast">
      <StyledThreadMessageBody>
        <Linkify
          options={{
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          {body}
        </Linkify>
      </StyledThreadMessageBody>
    </AnimatedEaseInOut>
  );
};
