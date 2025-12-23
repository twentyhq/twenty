import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{ $isEditMode: boolean }>`
  border-radius: ${({ theme }) => theme.border.radius.md};
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  pointer-events: ${({ $isEditMode }) => ($isEditMode ? 'none' : 'auto')};
`;

const StyledIframe = styled.iframe<{ $isEditMode: boolean }>`
  border: none;
  flex: 1;
  height: 100%;
  width: 100%;
  pointer-events: ${({ $isEditMode }) => ($isEditMode ? 'none' : 'auto')};
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

export type IframeWidgetProps = {
  widget: PageLayoutWidget;
};

export const IframeWidget = ({ widget }: IframeWidgetProps) => {
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const configuration = widget.configuration;

  if (!configuration || !('url' in configuration)) {
    throw new Error(`Invalid configuration for widget ${widget.id}`);
  }

  const url = configuration.url;
  const title = widget.title;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError || !isDefined(url)) {
    return (
      <StyledContainer $isEditMode={isPageLayoutInEditMode}>
        <StyledErrorContainer>
          <PageLayoutWidgetNoDataDisplay />
        </StyledErrorContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer $isEditMode={isPageLayoutInEditMode}>
      {isLoading && (
        <StyledLoadingContainer>
          <ChartSkeletonLoader />
        </StyledLoadingContainer>
      )}
      <StyledIframe
        $isEditMode={isPageLayoutInEditMode}
        src={url}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
        allow="encrypted-media"
        allowFullScreen
      />
    </StyledContainer>
  );
};
