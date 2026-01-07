import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

export const DashboardWidgetPlaceholder = () => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const handleClick = () => {
    if (!isPageLayoutInEditMode) {
      setIsPageLayoutInEditMode(true);
    }
    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
      resetNavigationStack: true,
    });
  };

  return (
    <WidgetCard
      variant="dashboard"
      isEditable={true}
      isEditing={false}
      isDragging={false}
      isResizing={false}
      onClick={handleClick}
      className="widget"
    >
      <WidgetCardHeader
        widgetId="widget-placeholder"
        isInEditMode={isPageLayoutInEditMode}
        isResizing={false}
        title={t`Add Widget`}
        isEmpty
      />
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noWidgets" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            <Trans>Add widget</Trans>
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            <Trans>Click to add your first widget</Trans>
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </WidgetCard>
  );
};
