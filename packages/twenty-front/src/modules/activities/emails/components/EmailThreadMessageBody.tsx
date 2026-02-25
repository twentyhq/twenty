import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Linkify from 'linkify-react';
import { useState } from 'react';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

import { EmailThreadMessageHtmlPreview } from '@/activities/emails/components/EmailThreadMessageHtmlPreview';
import { useEmailHtmlPreview } from '@/activities/emails/hooks/useEmailHtmlPreview';
import { Trans } from '@lingui/react/macro';
import { Loader } from 'twenty-ui/feedback';

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

const StyledToggleLink = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
    text-decoration: underline;
  }
`;

const StyledErrorText = styled.span`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledLoaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type EmailThreadMessageBodyProps = {
  body: string;
  isDisplayed: boolean;
  messageId?: string;
  canShowHtmlPreview?: boolean;
};

export const EmailThreadMessageBody = ({
  body,
  isDisplayed,
  messageId,
  canShowHtmlPreview = false,
}: EmailThreadMessageBodyProps) => {
  const [showHtml, setShowHtml] = useState(false);

  const { html, isLoading, error, fetchHtmlPreview, clearPreview } =
    useEmailHtmlPreview(messageId ?? '');

  const handleViewOriginal = async () => {
    await fetchHtmlPreview();
    setShowHtml(true);
  };

  const handleShowPlainText = () => {
    setShowHtml(false);
    clearPreview();
  };

  return (
    <AnimatedEaseInOut isOpen={isDisplayed} duration="fast">
      {showHtml && html ? (
        <>
          <EmailThreadMessageHtmlPreview html={html} />
          <StyledToggleLink onClick={handleShowPlainText}>
            <Trans>Show plain text</Trans>
          </StyledToggleLink>
        </>
      ) : (
        <StyledThreadMessageBody>
          <Linkify
            options={{
              target: '_blank',
              rel: 'noopener noreferrer',
            }}
          >
            {body}
          </Linkify>
          {canShowHtmlPreview && messageId && (
            <>
              {isLoading ? (
                <StyledLoaderContainer>
                  <Loader />
                </StyledLoaderContainer>
              ) : error ? (
                <StyledErrorText>{error}</StyledErrorText>
              ) : (
                <StyledToggleLink onClick={handleViewOriginal}>
                  <Trans>View original</Trans>
                </StyledToggleLink>
              )}
            </>
          )}
        </StyledThreadMessageBody>
      )}
    </AnimatedEaseInOut>
  );
};
