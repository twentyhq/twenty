import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetInvalidConfigDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetInvalidConfigDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { type WidgetAction } from '@/page-layout/widgets/types/WidgetAction';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { styled } from '@linaria/react';
import { type MouseEvent, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { IconLock } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { WidgetType } from '~/generated-metadata/graphql';

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
  isLastWidget: boolean;
  showHeader: boolean;
  hasAccess: boolean;
  restriction: WidgetAccessDenialInfo;
  actions: WidgetAction[];
  isInVerticalListTab: boolean;
  isMobile: boolean;
  isReorderEnabled: boolean;
  isDeletingWidgetEnabled: boolean;
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
  isLastWidget,
  showHeader,
  hasAccess,
  restriction,
  actions,
  isInVerticalListTab,
  isMobile,
  isReorderEnabled,
  isDeletingWidgetEnabled,
  onClick,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: WidgetCardShellProps) => {
  const { theme } = useContext(ThemeContext);

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
        isLastWidget={isLastWidget}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-widget-id={widget.id}
        data-testid={widget.id}
        className="widget"
      >
        {showHeader && (
          <WidgetCardHeader
            widgetId={widget.id}
            variant={variant}
            isInEditMode={isEditable}
            isResizing={isResizing}
            isReorderEnabled={isReorderEnabled}
            isDeletingWidgetEnabled={isDeletingWidgetEnabled}
            title={widget.title}
            onRemove={onRemove}
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
          isEditable={isEditable}
          isInVerticalListTab={isInVerticalListTab}
          isMobile={isMobile}
          hasInteractiveContent={widget.type === WidgetType.RECORD_TABLE}
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
