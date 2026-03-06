import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';

import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { WidgetType } from '~/generated-metadata/graphql';

const StyledVerticalListContainer = styled.div<{
  variant: PageLayoutVerticalListViewerVariant;
  shouldUseWhiteBackground: boolean;
}>`
  background: ${({ shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? themeCssVariables.background.primary
      : themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ variant }) =>
    variant === 'side-column' ? 0 : themeCssVariables.spacing[2]};
  padding: ${({ variant }) =>
    variant === 'side-column' ? 0 : themeCssVariables.spacing[2]};
`;

const StyledFieldsWidgetWrapper = styled.div<{
  variant: PageLayoutVerticalListViewerVariant;
}>`
  padding: ${({ variant }) =>
    variant === 'side-column' ? themeCssVariables.spacing[1] : '0'};
`;

type PageLayoutVerticalListViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutVerticalListViewer = ({
  widgets,
}: PageLayoutVerticalListViewerProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();

  const variant = getPageLayoutVerticalListViewerVariant({
    isInPinnedTab,
    isMobile,
    isInSidePanel,
  });

  return (
    <StyledVerticalListContainer
      variant={variant}
      shouldUseWhiteBackground={isMobile || isInSidePanel}
    >
      {widgets.map((widget) =>
        widget.type === WidgetType.FIELDS ? (
          <StyledFieldsWidgetWrapper key={widget.id} variant={variant}>
            <WidgetRenderer widget={widget} />
          </StyledFieldsWidgetWrapper>
        ) : (
          <div key={widget.id}>
            <WidgetRenderer widget={widget} />
          </div>
        ),
      )}
    </StyledVerticalListContainer>
  );
};
