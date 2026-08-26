import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetInvalidConfigDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetInvalidConfigDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { getWidgetContentPadding } from '@/page-layout/widgets/utils/getWidgetContentPadding';
import { isWidgetCardFlushInViewMode } from '@/page-layout/widgets/utils/isWidgetCardFlushInViewMode';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { styled } from '@linaria/react';
import { type MouseEvent, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { IconLock } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';
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
  const { theme } = useContext(ThemeContext);
  const { layoutMode } = usePageLayoutContentContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isVerticalList = layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;
  const isFixedHeightIframe =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE &&
    isVerticalList &&
    widget.type === WidgetType.IFRAME;
  const contentPadding = isWidgetCardFlushInViewMode({
    isEditable,
    variant,
  })
    ? getWidgetContentPadding(widget.type)
    : 'default';

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
          hasInteractiveContent={widget.type === WidgetType.RECORD_TABLE}
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
    </WidgetComponentInstanceContext.Provider>
  );
};
