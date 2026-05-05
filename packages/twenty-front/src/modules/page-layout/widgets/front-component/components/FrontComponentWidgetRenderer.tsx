import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';

import { isDefined } from 'twenty-shared/utils';

import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

const StyledContainer = styled.div<{ isInEditMode: boolean }>`
  height: 100%;
  overflow: auto;
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
  const { targetRecordIdentifier } = useLayoutRenderingContext();

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

  return (
    <StyledContainer isInEditMode={isPageLayoutInEditMode}>
      <Suspense fallback={null}>
        <FrontComponentRenderer
          frontComponentId={frontComponentId}
          selectedRecordIds={selectedRecordIds}
        />
      </Suspense>
    </StyledContainer>
  );
};
