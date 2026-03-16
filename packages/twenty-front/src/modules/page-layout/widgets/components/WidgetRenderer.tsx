import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetInvalidConfigDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetInvalidConfigDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { useIsCurrentWidgetLastOfTab } from '@/page-layout/widgets/hooks/useIsCurrentWidgetLastOfTab';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useWidgetActions } from '@/page-layout/widgets/hooks/useWidgetActions';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { styled } from '@linaria/react';
import { type MouseEvent, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { IconLock } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

const StyledEditingWidgetWrapper = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledNoAccessContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const { theme } = useContext(ThemeContext);
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { handleEditWidget } = useEditPageLayoutWidget();

  const isPageLayoutInEditMode = useAtomComponentStateValue(
    isPageLayoutInEditModeComponentState,
  );

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

  const isReorderEnabled =
    currentPageLayout.type !== PageLayoutType.RECORD_PAGE;

  const isDeletingWidgetEnabled =
    currentPageLayout.type !== PageLayoutType.RECORD_PAGE;

  const isWidgetEditable =
    isPageLayoutInEditMode &&
    (currentPageLayout.type !== PageLayoutType.RECORD_PAGE ||
      widget.type === WidgetType.FIELDS);

  // TODO: when we have more widgets without headers, we should use a more generic approach to hide the header
  // each widget type could have metadata (e.g., hasHeader: boolean or headerMode: 'always' | 'editOnly' | 'never')
  const isRichTextWidget = widget.type === WidgetType.STANDALONE_RICH_TEXT;
  const hideRichTextHeader = isRichTextWidget && !isPageLayoutInEditMode;

  const showHeader =
    layoutMode !== PageLayoutTabLayoutMode.CANVAS && !hideRichTextHeader;

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

  const actions = useWidgetActions({ widget });

  // TODO: remove once all record page layouts widgets use the editable contain in edit mode
  const shouldWrapWithEditingWrapper =
    isWidgetEditable && variant === 'side-column';

  const widgetCard = (
    <WidgetCard
      headerLess={!showHeader}
      variant={variant}
      isEditable={isWidgetEditable}
      onClick={isWidgetEditable ? handleClick : undefined}
      isEditing={isEditing}
      isDragging={isDragging}
      isResizing={isResizing}
      isLastWidget={isLastWidget}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-widget-id={widget.id}
      data-testid={widget.id}
      className="widget"
    >
      {showHeader && (
        <WidgetCardHeader
          widgetId={widget.id}
          variant={variant}
          isInEditMode={isWidgetEditable}
          isResizing={isResizing}
          isReorderEnabled={isReorderEnabled}
          isDeletingWidgetEnabled={isDeletingWidgetEnabled}
          title={widget.title}
          onRemove={handleRemove}
          actions={actions}
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

      <WidgetCardContent
        variant={variant}
        hasHeader={showHeader}
        isEditable={isWidgetEditable}
      >
        {hasAccess ? (
          <ErrorBoundary
            FallbackComponent={PageLayoutWidgetInvalidConfigDisplay}
            resetKeys={[
              widget.id,
              widget.configuration,
              widget.objectMetadataId,
            ]}
          >
            <WidgetContentRenderer widget={widget} />
          </ErrorBoundary>
        ) : (
          <StyledNoAccessContainer>
            <IconLock
              color={theme.font.color.tertiary}
              stroke={theme.icon.stroke.sm}
            />
          </StyledNoAccessContainer>
        )}
      </WidgetCardContent>
    </WidgetCard>
  );

  return (
    <WidgetComponentInstanceContext.Provider value={{ instanceId: widget.id }}>
      {shouldWrapWithEditingWrapper ? (
        <StyledEditingWidgetWrapper>{widgetCard}</StyledEditingWidgetWrapper>
      ) : (
        widgetCard
      )}
    </WidgetComponentInstanceContext.Provider>
  );
};
