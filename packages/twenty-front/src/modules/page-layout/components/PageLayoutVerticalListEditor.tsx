import { PageLayoutWidgetSortableItem } from '@/page-layout/components/dnd/PageLayoutWidgetSortableItem';
import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

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
  gap: ${themeCssVariables.spacing[4]};
  padding: ${({ variant }) =>
    variant === 'side-column'
      ? themeCssVariables.spacing[1]
      : themeCssVariables.spacing[2]};
`;

type PageLayoutVerticalListEditorProps = {
  widgets: PageLayoutWidget[];
  isReorderEnabled?: boolean;
  trailingElement?: ReactNode;
};

export const PageLayoutVerticalListEditor = ({
  widgets,
  isReorderEnabled = true,
  trailingElement,
}: PageLayoutVerticalListEditorProps) => {
  const { tabId } = usePageLayoutContentContext();

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
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
    >
      {widgets.map((widget, index) => (
        <PageLayoutWidgetSortableItem
          key={widget.id}
          widgetId={widget.id}
          tabId={tabId}
          index={index}
          disabled={!isReorderEnabled}
        >
          <WidgetRenderer widget={widget} />
        </PageLayoutWidgetSortableItem>
      ))}
      {trailingElement}
    </StyledVerticalListContainer>
  );
};
