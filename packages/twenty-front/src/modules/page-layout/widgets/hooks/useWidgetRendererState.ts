import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useIsCurrentWidgetLastOfTab } from '@/page-layout/widgets/hooks/useIsCurrentWidgetLastOfTab';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { useOpenWidgetSettingsInSidePanel } from '@/side-panel/hooks/useOpenWidgetSettingsInSidePanel';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { type MouseEvent } from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

export const useWidgetRendererState = (widget: PageLayoutWidget) => {
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { openWidgetSettingsInSidePanel } = useOpenWidgetSettingsInSidePanel();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const pageLayoutDraggingWidgetId = useAtomComponentStateValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const pageLayoutResizingWidgetId = useAtomComponentStateValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const isEditing = pageLayoutEditingWidgetId === widget.id;
  const isDragging = pageLayoutDraggingWidgetId === widget.id;
  const isResizing = pageLayoutResizingWidgetId === widget.id;

  const { hasAccess, restriction } = useWidgetPermissions(widget);

  const { layoutMode } = usePageLayoutContentContext();
  const { isInPinnedTab } = useIsInPinnedTab();
  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isLastWidget = useIsCurrentWidgetLastOfTab(widget.id);

  const isHeaderHiddenInViewMode =
    widget.type === WidgetType.STANDALONE_RICH_TEXT ||
    widget.type === WidgetType.EMAIL_THREAD;
  const hideHeaderInViewMode =
    isHeaderHiddenInViewMode && !isPageLayoutInEditMode;

  const showHeader =
    layoutMode !== PageLayoutTabLayoutMode.CANVAS && !hideHeaderInViewMode;

  const handleClick = () => {
    openWidgetSettingsInSidePanel({
      widgetId: widget.id,
      widgetType: widget.type,
    });
  };

  const handleRemove = (e?: MouseEvent) => {
    e?.stopPropagation();
    deletePageLayoutWidget(widget.id);
  };

  const setWidgetCardHovered = useSetAtomComponentFamilyState(
    widgetCardHoveredComponentFamilyState,
    widget.id,
  );

  const handleMouseEnter = () => {
    setWidgetCardHovered(true);
  };

  const handleMouseLeave = () => {
    setWidgetCardHovered(false);
  };

  const variant = getWidgetCardVariant({
    layoutMode,
    isInPinnedTab,
    pageLayoutType: currentPageLayout.type,
    isMobile,
    isInSidePanel,
  });

  const isInVerticalListTab =
    layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;

  return {
    isPageLayoutInEditMode,
    isEditing,
    isDragging,
    isResizing,
    hasAccess,
    restriction,
    currentPageLayout,
    isLastWidget,
    showHeader,
    variant,
    isMobile,
    isInVerticalListTab,
    handleClick,
    handleRemove,
    handleMouseEnter,
    handleMouseLeave,
  };
};
