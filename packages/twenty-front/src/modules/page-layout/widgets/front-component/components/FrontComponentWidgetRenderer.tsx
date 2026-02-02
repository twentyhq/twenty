import styled from '@emotion/styled';
import { Suspense, lazy } from 'react';

import { isDefined } from 'twenty-shared/utils';

import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const configuration = widget.configuration;

  if (
    !isDefined(configuration) ||
    !isWidgetConfigurationOfType(configuration, 'FrontComponentConfiguration')
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const frontComponentId = configuration.frontComponentId;

  return (
    <StyledContainer isInEditMode={isPageLayoutInEditMode}>
      <Suspense fallback={null}>
        <FrontComponentRenderer frontComponentId={frontComponentId} />
      </Suspense>
    </StyledContainer>
  );
};
