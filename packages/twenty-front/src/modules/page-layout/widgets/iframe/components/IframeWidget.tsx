import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ $isEditMode: boolean }>`
  box-sizing: border-box;
  border-radius: ${themeCssVariables.border.radius.md};
  background: ${themeCssVariables.background.primary};
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
  padding-top: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[2]};
  background: ${themeCssVariables.background.primary};
  pointer-events: none;
  z-index: 1;
`;

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

export type IframeWidgetProps = {
  widget: PageLayoutWidget;
};

export const IframeWidget = ({ widget }: IframeWidgetProps) => {
  const isPageLayoutInEditMode = useAtomComponentStateValue(
    isPageLayoutInEditModeComponentState,
  );

  const configuration = widget.configuration;

  if (!isDefined(configuration) || !('url' in configuration)) {
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
          <WidgetSkeletonLoader />
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
