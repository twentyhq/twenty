import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { CanvasWidgetCard } from '@/page-layout/widgets/widget-card/components/CanvasWidgetCard';
import { CanvasWidgetCardContent } from '@/page-layout/widgets/widget-card/components/CanvasWidgetCardContent';
import { DashboardWidgetCard } from '@/page-layout/widgets/widget-card/components/DashboardWidgetCard';
import { DashboardWidgetCardContent } from '@/page-layout/widgets/widget-card/components/DashboardWidgetCardContent';
import { DashboardWidgetCardEditable } from '@/page-layout/widgets/widget-card/components/DashboardWidgetCardEditable';
import { RecordPageWidgetCard } from '@/page-layout/widgets/widget-card/components/RecordPageWidgetCard';
import { RecordPageWidgetCardContent } from '@/page-layout/widgets/widget-card/components/RecordPageWidgetCardContent';
import { RecordPageWidgetCardEditable } from '@/page-layout/widgets/widget-card/components/RecordPageWidgetCardEditable';
import { SideColumnWidgetCard } from '@/page-layout/widgets/widget-card/components/SideColumnWidgetCard';
import { SideColumnWidgetCardContent } from '@/page-layout/widgets/widget-card/components/SideColumnWidgetCardContent';
import { SideColumnWidgetCardEditable } from '@/page-layout/widgets/widget-card/components/SideColumnWidgetCardEditable';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { useTheme } from '@emotion/react';
import { type MouseEvent } from 'react';
import { IconLock } from 'twenty-ui/display';
import { PageLayoutType, type PageLayoutWidget } from '~/generated/graphql';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const theme = useTheme();
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { handleEditWidget } = useEditPageLayoutWidget();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const draggingWidgetId = useRecoilComponentValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const resizingWidgetId = useRecoilComponentValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const currentlyEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const isEditing = currentlyEditingWidgetId === widget.id;

  const isDragging = draggingWidgetId === widget.id;

  const isResizing = resizingWidgetId === widget.id;

  const { hasAccess, restriction } = useWidgetPermissions(widget);

  const { layoutMode } = usePageLayoutContentContext();
  const { isInPinnedTab } = useIsInPinnedTab();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const showHeader = layoutMode !== 'canvas' && !isInPinnedTab;

  const handleClick = () => {
    handleEditWidget({
      widgetId: widget.id,
      widgetType: widget.type,
    });
  };

  const handleRemove = (e?: MouseEvent) => {
    e?.stopPropagation();
    deletePageLayoutWidget(widget.id);
  };

  const setIsHovered = useSetRecoilComponentFamilyState(
    widgetCardHoveredComponentFamilyState,
    widget.id,
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (layoutMode === 'canvas') {
    return (
      <CanvasWidgetCard
        onClick={isPageLayoutInEditMode ? handleClick : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CanvasWidgetCardContent>
          {hasAccess && <WidgetContentRenderer widget={widget} />}
        </CanvasWidgetCardContent>
      </CanvasWidgetCard>
    );
  }

  if (isInPinnedTab) {
    if (isPageLayoutInEditMode) {
      return (
        <SideColumnWidgetCardEditable
          isDragging={isDragging}
          isResizing={isResizing}
          isEditing={isEditing}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <SideColumnWidgetCardContent>
            {hasAccess && <WidgetContentRenderer widget={widget} />}
          </SideColumnWidgetCardContent>
        </SideColumnWidgetCardEditable>
      );
    }

    return (
      <SideColumnWidgetCard
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SideColumnWidgetCardContent>
          {hasAccess && <WidgetContentRenderer widget={widget} />}
        </SideColumnWidgetCardContent>
      </SideColumnWidgetCard>
    );
  }

  if (currentPageLayout.type === PageLayoutType.DASHBOARD) {
    if (isPageLayoutInEditMode) {
      return (
        <DashboardWidgetCardEditable
          isDragging={isDragging}
          isResizing={isResizing}
          isEditing={isEditing}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showHeader && (
            <WidgetCardHeader
              widgetId={widget.id}
              isInEditMode={isPageLayoutInEditMode}
              isResizing={isResizing}
              title={widget.title}
              onRemove={handleRemove}
              forbiddenDisplay={
                !hasAccess && (
                  <PageLayoutWidgetForbiddenDisplay
                    widgetId={widget.id}
                    restriction={restriction}
                  />
                )
              }
            />
          )}

          <DashboardWidgetCardContent>
            {hasAccess && <WidgetContentRenderer widget={widget} />}
            {!hasAccess && (
              <IconLock
                color={theme.font.color.tertiary}
                stroke={theme.icon.stroke.sm}
              />
            )}
          </DashboardWidgetCardContent>
        </DashboardWidgetCardEditable>
      );
    }

    return (
      <DashboardWidgetCard
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showHeader && (
          <WidgetCardHeader
            widgetId={widget.id}
            isInEditMode={isPageLayoutInEditMode}
            isResizing={isResizing}
            title={widget.title}
            onRemove={handleRemove}
            forbiddenDisplay={
              !hasAccess && (
                <PageLayoutWidgetForbiddenDisplay
                  widgetId={widget.id}
                  restriction={restriction}
                />
              )
            }
          />
        )}

        <DashboardWidgetCardContent>
          {hasAccess && <WidgetContentRenderer widget={widget} />}
          {!hasAccess && (
            <IconLock
              color={theme.font.color.tertiary}
              stroke={theme.icon.stroke.sm}
            />
          )}
        </DashboardWidgetCardContent>
      </DashboardWidgetCard>
    );
  }

  // PageLayoutType.RECORD_PAGE
  if (isPageLayoutInEditMode) {
    return (
      <RecordPageWidgetCardEditable
        isDragging={isDragging}
        isResizing={isResizing}
        isEditing={isEditing}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showHeader && (
          <WidgetCardHeader
            widgetId={widget.id}
            isInEditMode={isPageLayoutInEditMode}
            isResizing={isResizing}
            title={widget.title}
            onRemove={handleRemove}
            forbiddenDisplay={
              !hasAccess && (
                <PageLayoutWidgetForbiddenDisplay
                  widgetId={widget.id}
                  restriction={restriction}
                />
              )
            }
          />
        )}

        <RecordPageWidgetCardContent>
          {hasAccess && <WidgetContentRenderer widget={widget} />}
        </RecordPageWidgetCardContent>
      </RecordPageWidgetCardEditable>
    );
  }

  return (
    <RecordPageWidgetCard
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showHeader && (
        <WidgetCardHeader
          widgetId={widget.id}
          isInEditMode={isPageLayoutInEditMode}
          isResizing={isResizing}
          title={widget.title}
          onRemove={handleRemove}
          forbiddenDisplay={
            !hasAccess && (
              <PageLayoutWidgetForbiddenDisplay
                widgetId={widget.id}
                restriction={restriction}
              />
            )
          }
        />
      )}

      <RecordPageWidgetCardContent>
        {hasAccess && <WidgetContentRenderer widget={widget} />}
      </RecordPageWidgetCardContent>
    </RecordPageWidgetCard>
  );
};
