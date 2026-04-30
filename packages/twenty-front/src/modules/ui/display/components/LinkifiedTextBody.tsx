import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import Linkify from 'linkify-react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

const StyledTextBody = styled(motion.div)`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${themeCssVariables.spacing[4]};
  overflow-wrap: break-word;
  white-space: pre-line;

  a {
    color: ${themeCssVariables.color.blue};
    text-decoration: underline;

    &:hover {
      text-decoration-color: ${themeCssVariables.color.blue};
    }
  }
`;

type LinkifiedTextBodyProps = {
  body: string;
  isDisplayed: boolean;
};

export const LinkifiedTextBody = ({
  body,
  isDisplayed,
}: LinkifiedTextBodyProps) => {
  return (
    <AnimatedEaseInOut isOpen={isDisplayed} duration="fast">
      <StyledTextBody>
        <Linkify
          options={{
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          {body}
        </Linkify>
      </StyledTextBody>
    </AnimatedEaseInOut>
  );
};
