import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useWidgetDashboardFilter } from '@/page-layout/hooks/useWidgetDashboardFilter';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetDashboardFilterHeaderContent } from '@/page-layout/utils/getWidgetDashboardFilterHeaderContent';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetInvalidConfigDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetInvalidConfigDisplay';
import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetDashboardFilterHeaderItems } from '@/page-layout/widgets/components/WidgetDashboardFilterHeaderItems';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { getWidgetCardContentPadding } from '@/page-layout/widgets/utils/getWidgetCardContentPadding';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

const StyledNoAccessContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type WidgetCardShellProps = {
  widget: PageLayoutWidget;
  variant: WidgetCardVariant;
  isEditable: boolean;
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  showHeader: boolean;
  hasAccess: boolean;
  restriction: WidgetAccessDenialInfo;
  onClick?: () => void;
  onRemove: (e?: MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const WidgetCardShell = ({
  widget,
  variant,
  isEditable,
  isEditing,
  isDragging,
  isResizing,
  showHeader,
  hasAccess,
  restriction,
  onClick,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: WidgetCardShellProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { layoutMode, presentation } = usePageLayoutContentContext();
  const { isInvalid: isDashboardFilterInvalid, indicators } =
    useWidgetDashboardFilter();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const dashboardFilterHeaderContent = getWidgetDashboardFilterHeaderContent({
    indicators,
    isPageLayoutInEditMode,
  });
  const hasDashboardFilterHeaderItems =
    hasAccess &&
    (isPageLayoutInEditMode || !isDashboardFilterInvalid) &&
    (isNonEmptyArray(dashboardFilterHeaderContent.fieldLabels) ||
      isNonEmptyArray(dashboardFilterHeaderContent.pills) ||
      isDefined(dashboardFilterHeaderContent.hoverIndicatorText));

  const isVerticalList = layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;
  const isFixedHeightIframe =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE &&
    isVerticalList &&
    widget.type === WidgetType.IFRAME &&
    !isViewportFillingWidget(widget);
  const contentPadding = getWidgetCardContentPadding({
    isEditable,
    pageLayoutType: currentPageLayout.type,
    presentation,
    variant,
    widgetType: widget.type,
  });

  const dataTestId =
    widget.type === WidgetType.FIELDS ? 'record-fields-widget' : widget.id;

  return (
    <WidgetComponentInstanceContext.Provider value={{ instanceId: widget.id }}>
      <WidgetCard
        headerLess={!showHeader}
        variant={variant}
        isEditable={isEditable}
        onClick={onClick}
        isEditing={isEditing}
        isDragging={isDragging}
        isResizing={isResizing}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-widget-id={widget.id}
        data-testid={dataTestId}
        className="widget"
      >
        {showHeader && (
          <WidgetCardHeader
            className="widget-card-header"
            widgetId={widget.id}
            variant={variant}
            isInEditMode={isEditable}
            hasAccess={hasAccess}
            isResizing={isResizing}
            title={widget.title}
            onRemove={onRemove}
            shouldMeasureHeaderPills={
              isNonEmptyArray(dashboardFilterHeaderContent.fieldLabels) ||
              isNonEmptyArray(dashboardFilterHeaderContent.pills)
            }
            headerPills={
              hasDashboardFilterHeaderItems ? (
                <WidgetDashboardFilterHeaderItems
                  content={dashboardFilterHeaderContent}
                />
              ) : undefined
            }
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
          isEditable={isEditable}
          hasInteractiveContent={
            widget.type === WidgetType.RECORD_TABLE ||
            widget.type === WidgetType.STANDALONE_RICH_TEXT
          }
          isFixedHeight={isFixedHeightIframe}
          contentPadding={contentPadding}
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
              {isDashboardFilterInvalid ? (
                <PageLayoutWidgetStatusDisplay
                  tooltipId={`widget-invalid-dashboard-filter-tooltip-${widget.id}`}
                  text={t`Invalid filter`}
                  tooltipContent={t`The dashboard date range is not valid. Pick another range.`}
                />
              ) : (
                <WidgetContentRenderer widget={widget} />
              )}
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
    </WidgetComponentInstanceContext.Provider>
  );
};
