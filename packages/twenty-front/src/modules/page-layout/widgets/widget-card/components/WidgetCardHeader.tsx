import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { WIDGET_CARD_HEADER_PILLS_MAX_WIDTH_RATIO } from '@/page-layout/constants/WidgetCardHeaderPillsMaxWidthRatio';
import { WidgetCardHeaderPillsMaxWidthContext } from '@/page-layout/contexts/WidgetCardHeaderPillsMaxWidthContext';
import { getWidgetCardHeaderPillsMaxWidth } from '@/page-layout/utils/getWidgetCardHeaderPillsMaxWidth';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { WidgetCardHeaderActionsRenderer } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionsRenderer';
import { WidgetCardHeaderHoverReveal } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderHoverReveal';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { type ReactNode, useMemo, useRef, useState } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconTrash } from 'twenty-ui/icon';

import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { WidgetGrip } from '@/page-layout/widgets/widget-card/components/WidgetGrip';
import { AnimatePresence, motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

export type WidgetCardHeaderProps = {
  variant: WidgetCardVariant;
  widgetId: string;
  isInEditMode: boolean;
  isEmpty?: boolean;
  hasAccess?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  forbiddenDisplay?: ReactNode;
  headerPills?: ReactNode;
  shouldMeasureHeaderPills?: boolean;
  className?: string;
  isResizing?: boolean;
};

const StyledWidgetCardHeader = styled.div<{ shouldInset: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${({ shouldInset }) =>
    shouldInset
      ? `calc(${themeCssVariables.spacing[6]} + var(--widget-card-title-padding-top))`
      : themeCssVariables.spacing[6]};
  padding: ${({ shouldInset }) =>
    shouldInset
      ? `var(--widget-card-title-padding-top) var(--widget-card-padding-inline) 0`
      : '0'};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  position: relative;
  user-select: none;
`;

type MeasuredPart = 'header' | 'title' | 'titleNatural' | 'pills';

const StyledTitleMeasure = styled.div`
  position: absolute;
  visibility: hidden;
  white-space: nowrap;
  width: max-content;

  &::before {
    content: attr(data-title);
  }

  &[data-count]::after {
    content: attr(data-count);
    font-weight: ${themeCssVariables.font.weight.regular};
    margin-left: ${themeCssVariables.spacing[1]};
  }
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.regular};
`;

// Keeps its natural width up to the room it is given, so the title truncates first; the padding keeps focus rings inside the clip
const StyledHeaderPillsContainer = styled.div<{ maxWidth: string }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  margin: calc(-1 * ${themeCssVariables.spacing[1]});
  max-width: ${({ maxWidth }) => maxWidth};
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]};
  position: relative;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

const StyledIconButtonContainerBase = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;
const StyledIconButtonContainer = motion.create(StyledIconButtonContainerBase);

export const WidgetCardHeader = ({
  variant,
  widgetId,
  isEmpty = false,
  isInEditMode = false,
  hasAccess = true,
  isResizing = false,
  title,
  onRemove,
  forbiddenDisplay,
  headerPills,
  shouldMeasureHeaderPills = false,
  className,
}: WidgetCardHeaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();
  const widgetCardHovered = useAtomComponentFamilyStateValue(
    widgetCardHoveredComponentFamilyState,
    widgetId,
  );

  const widgetHeaderCount = useAtomComponentFamilyStateValue(
    widgetHeaderCountComponentFamilyState,
    widgetId,
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleMeasureRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<Partial<Record<MeasuredPart, number>>>(
    {},
  );
  const widthChangeHandlers = useMemo(() => {
    const getWidthChangeHandler =
      (part: MeasuredPart) =>
      ({ width }: { width: number }) =>
        setWidths((previousWidths) =>
          previousWidths[part] === width
            ? previousWidths
            : { ...previousWidths, [part]: width },
        );

    return {
      header: getWidthChangeHandler('header'),
      title: getWidthChangeHandler('title'),
      titleNatural: getWidthChangeHandler('titleNatural'),
      pills: getWidthChangeHandler('pills'),
    };
  }, []);
  const isHeaderPillsMeasured =
    isDefined(headerPills) && shouldMeasureHeaderPills;

  const pillsMaxWidth =
    isHeaderPillsMeasured &&
    isDefined(widths.header) &&
    isDefined(widths.title) &&
    isDefined(widths.titleNatural) &&
    isDefined(widths.pills)
      ? getWidgetCardHeaderPillsMaxWidth({
          headerWidth: widths.header,
          titleWidth: widths.title,
          titleNaturalWidth: widths.titleNatural,
          pillsWidth: widths.pills,
        })
      : null;

  const titleText = isEmpty ? t`Add Widget` : title;

  const isRemoveButtonShown =
    !isResizing && !isEmpty && isInEditMode && isDefined(onRemove);

  const shouldInset = variant === 'flush';
  return (
    <StyledWidgetCardHeader
      ref={headerRef}
      className={className}
      shouldInset={shouldInset}
    >
      <AnimatePresence initial={false}>
        {!isEmpty && isInEditMode && <WidgetGrip className="drag-handle" />}
      </AnimatePresence>
      <StyledTitleContainer ref={titleRef}>
        <OverflowingTextWithTooltip text={titleText} />
        {isDefined(widgetHeaderCount) && (
          <StyledCount>{formatNumber(widgetHeaderCount)}</StyledCount>
        )}
        {isHeaderPillsMeasured && (
          <StyledTitleMeasure
            ref={titleMeasureRef}
            aria-hidden
            data-title={titleText}
            data-count={
              isDefined(widgetHeaderCount)
                ? formatNumber(widgetHeaderCount)
                : undefined
            }
          />
        )}
      </StyledTitleContainer>
      {isDefined(headerPills) && (
        <StyledHeaderPillsContainer
          ref={pillsRef}
          maxWidth={
            isDefined(pillsMaxWidth)
              ? `${pillsMaxWidth}px`
              : `${WIDGET_CARD_HEADER_PILLS_MAX_WIDTH_RATIO * 100}%`
          }
        >
          {isHeaderPillsMeasured && (
            <>
              <NodeDimensionEffect
                elementRef={headerRef}
                onDimensionChange={widthChangeHandlers.header}
              />
              <NodeDimensionEffect
                elementRef={titleRef}
                onDimensionChange={widthChangeHandlers.title}
              />
              <NodeDimensionEffect
                elementRef={titleMeasureRef}
                onDimensionChange={widthChangeHandlers.titleNatural}
              />
              <NodeDimensionEffect
                elementRef={pillsRef}
                onDimensionChange={widthChangeHandlers.pills}
              />
            </>
          )}
          <WidgetCardHeaderPillsMaxWidthContext.Provider value={pillsMaxWidth}>
            {headerPills}
          </WidgetCardHeaderPillsMaxWidthContext.Provider>
        </StyledHeaderPillsContainer>
      )}
      <StyledRightContainer>
        {hasAccess && <WidgetCardHeaderActionsRenderer />}
        {isDefined(forbiddenDisplay) && forbiddenDisplay}
        {/* Keeps its slot, so the header pills do not move when it appears */}
        {isRemoveButtonShown && isDefined(headerPills) && (
          <WidgetCardHeaderHoverReveal isAlwaysVisible={false}>
            <IconButton
              aria-label={t`Remove widget`}
              onClick={onRemove}
              variant="ghost"
              size="sm"
            >
              <IconTrash />
            </IconButton>
          </WidgetCardHeaderHoverReveal>
        )}
        <AnimatePresence initial={false}>
          {isRemoveButtonShown &&
            !isDefined(headerPills) &&
            widgetCardHovered && (
              <StyledIconButtonContainer
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: theme.animation.duration.fast,
                  ease: 'easeInOut',
                }}
              >
                <IconButton
                  aria-label={t`Remove widget`}
                  onClick={onRemove}
                  variant="ghost"
                  size="sm"
                >
                  <IconTrash />
                </IconButton>
              </StyledIconButtonContainer>
            )}
        </AnimatePresence>
      </StyledRightContainer>
    </StyledWidgetCardHeader>
  );
};
