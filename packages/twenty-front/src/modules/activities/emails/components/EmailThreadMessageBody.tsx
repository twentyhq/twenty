import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

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
const autoLink = (text: string): string => {
  const urlRegex =
    /((https?:\/\/|www\.)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/gi;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  let linked = text.replace(urlRegex, (url) => {
    let href = url;
    if (!href.startsWith('http')) {
      href = 'https://' + href;
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  linked = linked.replace(emailRegex, (email) => {
    if (linked.includes(`>${email}<`)) return email;
    return `<a href="mailto:${email}">${email}</a>`;
  });

  return linked;
};

export const EmailThreadMessageBody = ({
  body,
  isDisplayed,
}: EmailThreadMessageBodyProps) => {
  return (
    <AnimatedEaseInOut isOpen={isDisplayed} duration="fast">
      <StyledThreadMessageBody
        dangerouslySetInnerHTML={{ __html: autoLink(body) }}
      />
    </AnimatedEaseInOut>
  );
};
