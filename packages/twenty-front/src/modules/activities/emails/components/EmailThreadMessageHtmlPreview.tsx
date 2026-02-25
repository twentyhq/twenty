import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useRef, useState } from 'react';

const StyledIframeContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-top: ${({ theme }) => theme.spacing(4)};
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  border: none;
  width: 100%;
  display: block;
`;

const MAX_IFRAME_HEIGHT = 600;

// Force a light background so email HTML is always readable,
// regardless of the app's dark/light mode.
// These colors are injected into the iframe's srcDoc as raw CSS,
// so they cannot use Emotion theme variables.
// eslint-disable-next-line twenty/no-hardcoded-colors
const STYLE_RESET = `
<style>
  html, body {
    background-color: #ffffff !important;
    color: #1a1a1a !important;
    margin: 0;
    padding: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  img {
    max-width: 100%;
    height: auto;
  }
</style>
`;

type EmailThreadMessageHtmlPreviewProps = {
  html: string;
};

export const EmailThreadMessageHtmlPreview = ({
  html,
}: EmailThreadMessageHtmlPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);
  const { t } = useLingui();

  const wrappedHtml = useMemo(() => {
    // Inject reset styles before closing </head> or at the start of the document
    if (html.includes('</head>')) {
      return html.replace('</head>', `${STYLE_RESET}</head>`);
    }

    return `${STYLE_RESET}${html}`;
  }, [html]);

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
        srcDoc={wrappedHtml}
        sandbox="allow-same-origin"
        onLoad={handleLoad}
        height={height}
        title={t`Email HTML preview`}
      />
    </StyledIframeContainer>
  );
};
