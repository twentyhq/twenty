import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';

import { isDefined } from 'twenty-shared/utils';
import { usePreventPageZoomRef } from 'twenty-ui/utilities';

import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { isFullPageWidget } from '@/page-layout/widgets/utils/isFullPageWidget';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const StyledContainer = styled.div<{
  isInEditMode: boolean;
  isSoloLayout: boolean;
}>`
  box-sizing: border-box;
  height: var(--widget-height, 100%);
  overflow: var(
    --widget-scroll-overflow,
    ${({ isSoloLayout }) => (isSoloLayout ? 'visible' : 'auto')}
  );
  pointer-events: ${({ isInEditMode }) => (isInEditMode ? 'none' : 'auto')};
  width: 100%;
`;

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

type FrontComponentWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const FrontComponentWidgetRenderer = ({
  widget,
}: FrontComponentWidgetRendererProps) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { layoutMode, presentation } = usePageLayoutContentContext();
  const { layoutType, targetRecordIdentifier } = useLayoutRenderingContext();
  const isFullPageFrontComponent = isFullPageWidget({
    pageLayoutType: layoutType,
    presentation,
  });
  const shouldPreventPageZoom =
    !isPageLayoutInEditMode &&
    (isFullPageFrontComponent ||
      (layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
        isViewportFillingWidget(widget)) ||
      (layoutMode === PageLayoutTabLayoutMode.CANVAS &&
        presentation === 'solo'));
  const containerRef = usePreventPageZoomRef({
    preventPageZoom: shouldPreventPageZoom,
  });

  const configuration = widget.configuration;

  if (
    !isDefined(configuration) ||
    !isWidgetConfigurationOfType(configuration, 'FrontComponentConfiguration')
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const frontComponentId = configuration.frontComponentId;
  const selectedRecordIds = isDefined(targetRecordIdentifier?.id)
    ? [targetRecordIdentifier.id]
    : undefined;
  const loadingFallback = isFullPageFrontComponent ? null : (
    <FrontComponentSkeletonLoader />
  );

  return (
    <StyledContainer
      ref={containerRef}
      isInEditMode={isPageLayoutInEditMode}
      isSoloLayout={presentation === 'solo'}
    >
      <Suspense fallback={loadingFallback}>
        <FrontComponentRenderer
          frontComponentId={frontComponentId}
          selectedRecordIds={selectedRecordIds}
          objectNameSingular={targetRecordIdentifier?.targetObjectNameSingular}
          loadingFallback={loadingFallback}
          preventPageZoom={shouldPreventPageZoom}
        />
      </Suspense>
    </StyledContainer>
  );
};
