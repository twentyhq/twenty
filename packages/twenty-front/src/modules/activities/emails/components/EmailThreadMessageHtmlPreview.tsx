import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useRef, useState } from 'react';

const StyledIframeContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  border: none;
  width: 100%;
  display: block;
`;

const MAX_IFRAME_HEIGHT = 600;

type EmailThreadMessageHtmlPreviewProps = {
  html: string;
};

export const EmailThreadMessageHtmlPreview = ({
  html,
}: EmailThreadMessageHtmlPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);
  const { t } = useLingui();

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;

    if (!iframe?.contentDocument?.body) {
      return;
    }

    const contentHeight = iframe.contentDocument.body.scrollHeight;

    setHeight(Math.min(contentHeight, MAX_IFRAME_HEIGHT));
  }, []);

  return (
    <StyledIframeContainer>
      <StyledIframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-same-origin"
        onLoad={handleLoad}
        height={height}
        title={t`Email HTML preview`}
      />
    </StyledIframeContainer>
  );
};
