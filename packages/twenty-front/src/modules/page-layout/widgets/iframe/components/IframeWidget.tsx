import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import styled from '@emotion/styled';
import { useState } from 'react';

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
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.primary};
  pointer-events: none;
  z-index: 1;
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
        <StyledLoadingContainer>
          <ChartSkeletonLoader />
        </StyledLoadingContainer>
      )}
      <StyledIframe
        src={url}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-forms allow-popups"
        allow="encrypted-media"
        allowFullScreen
      />
    </StyledContainer>
  );
};
