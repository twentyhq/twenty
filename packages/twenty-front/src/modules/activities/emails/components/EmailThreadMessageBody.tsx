import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import Linkify from 'linkify-react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

const StyledThreadMessageBody = styled(motion.div)`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${themeCssVariables.spacing[4]};
  white-space: pre-line;
  overflow-wrap: break-word;

  a {
    color: ${themeCssVariables.font.color.primary};

    text-decoration: underline;
    text-decoration-color: ${themeCssVariables.font.color.primary};

    &:hover {
      color: ${themeCssVariables.font.color.tertiary};
      text-decoration-color: ${themeCssVariables.border.color.strong};
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
