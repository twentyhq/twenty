import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

export const StandaloneWidgetPlaceholder = () => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  return (
    <WidgetCard
      variant="standalone"
      isEditable={false}
      isEditing={false}
      isDragging={false}
      isResizing={false}
      className="widget"
    >
      <WidgetCardHeader
        variant="standalone"
        widgetId="widget-placeholder"
        isInEditMode={isPageLayoutInEditMode}
        isResizing={false}
        title={t`Add Widget`}
        isEmpty
      />
      <AnimatedPlaceholderEmptyContainer
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noWidgets" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            <Trans>Nothing to see</Trans>
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            <Trans>This page has no content</Trans>
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </WidgetCard>
  );
};
