import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { AnimatedEaseInOut } from 'twenty-ui';

const StyledThreadMessageBody = styled(motion.div)`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(4)};
  white-space: pre-line;
  overflow-wrap: break-word;
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
      <StyledThreadMessageBody>{body}</StyledThreadMessageBody>
    </AnimatedEaseInOut>
  );
};
