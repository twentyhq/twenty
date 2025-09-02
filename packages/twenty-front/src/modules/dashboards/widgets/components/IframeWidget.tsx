import styled from '@emotion/styled';
import { useState } from 'react';
import { IconLoader } from 'twenty-ui/display';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledIframe = styled.iframe`
  border: none;
  flex: 1;
  height: 100%;
  width: 100%;
`;

const StyledLoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 1;

  &.loaded {
    opacity: 0;
  }
`;

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledErrorUrl = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
  word-break: break-all;
`;

export type IframeWidgetProps = {
  url: string;
  title?: string;
};

export const IframeWidget = ({
  url,
  title = 'Embedded Content',
}: IframeWidgetProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!url) {
    return (
      <StyledContainer>
        <StyledErrorContainer>
          <StyledErrorMessage>No URL configured</StyledErrorMessage>
          <StyledErrorUrl>
            Please configure a URL for this widget
          </StyledErrorUrl>
        </StyledErrorContainer>
      </StyledContainer>
    );
  }

  if (hasError) {
    return (
      <StyledContainer>
        <StyledErrorContainer>
          <StyledErrorMessage>Failed to load content</StyledErrorMessage>
          <StyledErrorUrl>{url}</StyledErrorUrl>
        </StyledErrorContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {isLoading && (
        <StyledLoadingContainer className={!isLoading ? 'loaded' : ''}>
          <IconLoader size="large" />
        </StyledLoadingContainer>
      )}
      <StyledIframe
        src={url}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </StyledContainer>
  );
};
