import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { GraphWidgetLegendDot } from '@/page-layout/widgets/graph/components/GraphWidgetLegendDot';
import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { LEGEND_ITEM_ESTIMATED_WIDTH } from '@/page-layout/widgets/graph/constants/LegendItemEstimatedWidth';
import { LEGEND_LABEL_MAX_WIDTH } from '@/page-layout/widgets/graph/constants/LegendLabelMaxWidth';
import { LEGEND_PAGINATION_CONTROLS_WIDTH } from '@/page-layout/widgets/graph/constants/LegendPaginationControlsWidth';
import { useLegendItemToggle } from '@/page-layout/widgets/graph/hooks/useLegendItemToggle';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useRef, useState } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type GraphWidgetLegendItem = {
  id: string;
  label: string;
  color: string;
};

type GraphWidgetLegendProps = {
  items: GraphWidgetLegendItem[];
  show?: boolean;
};

type AnimationDirection = 'forward' | 'backward';

const StyledAnimationClipContainer = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const StyledLegendMotionWrapperBase = styled.div`
  width: 100%;
`;
const StyledLegendMotionWrapper = motion.create(StyledLegendMotionWrapperBase);

const StyledItemsWrapperBase = styled.div<{ centered?: boolean }>`
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: ${({ centered }) => (centered ? 'center' : 'flex-start')};
  min-width: 0;
`;
const StyledItemsWrapper = motion.create(StyledItemsWrapperBase);

const StyledLegendContainer = styled.div<{ needsPagination: boolean }>`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: ${({ needsPagination }) =>
    needsPagination ? 'flex-start' : 'center'};
  overflow: hidden;
  padding-top: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLegendItem = styled.div<{
  canShrink?: boolean;
  isHidden?: boolean;
  isInteractive?: boolean;
}>`
  align-items: center;
  cursor: ${({ isInteractive }) => (isInteractive ? 'pointer' : 'default')};
  display: flex;
  flex-shrink: ${({ canShrink }) => (canShrink ? 1 : 0)};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledLegendLabel = styled.div<{
  fixedWidth?: boolean;
  isHidden?: boolean;
}>`
  color: ${themeCssVariables.font.color.secondary};
  opacity: ${({ isHidden }) =>
    isHidden ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1};
  overflow: hidden;
  text-decoration: ${({ isHidden }) => (isHidden ? 'line-through' : 'none')};
  width: ${({ fixedWidth }) =>
    fixedWidth ? `${LEGEND_LABEL_MAX_WIDTH}px` : 'auto'};

  :hover {
    opacity: 1;
  }
`;

const StyledLegendDotWrapper = styled.div<{ isHidden?: boolean }>`
  display: flex;
  opacity: ${({ isHidden }) =>
    isHidden ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1};
`;

const StyledPaginationContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[0.5]};
`;

const StyledPaginationIndicator = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const legendEnterExitVariants = {
  hidden: {
    y: 10,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: 10,
    opacity: 0,
  },
};

export const GraphWidgetLegend = ({
  items,
  show = true,
}: GraphWidgetLegendProps) => {
  const { theme } = useContext(ThemeContext);

  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [containerWidth, setContainerWidth] = useState(0);

  const [animationDirection, setAnimationDirection] =
    useState<AnimationDirection>('forward');

  const isPageLayoutInEditMode = useAtomComponentStateValue(
    isPageLayoutInEditModeComponentState,
  );

  const isInteractive = !isPageLayoutInEditMode;

  const setGraphWidgetHighlightedLegendId = useSetAtomComponentState(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const [graphWidgetHiddenLegendIds, setGraphWidgetHiddenLegendIds] =
    useAtomComponentState(graphWidgetHiddenLegendIdsComponentState);

  const itemIds = items.map((item) => item.id);

  const { toggleLegendItem } = useLegendItemToggle({
    itemIds,
    isInteractive,
  });

  if (isPageLayoutInEditMode && graphWidgetHiddenLegendIds.length > 0) {
    setGraphWidgetHiddenLegendIds([]);
  }

  const handleLegendItemMouseEnter = (itemId: string) => {
    if (!isInteractive) {
      return;
    }
    setGraphWidgetHighlightedLegendId(itemId);
  };

  const handleLegendItemMouseLeave = () => {
    if (!isInteractive) {
      return;
    }
    setGraphWidgetHighlightedLegendId(null);
  };

  const shouldShowLegend = show && items.length > 1;

  const availableWidth = containerWidth - LEGEND_PAGINATION_CONTROLS_WIDTH;

  const itemsPerPage = Math.max(
    1,
    Math.floor(availableWidth / LEGEND_ITEM_ESTIMATED_WIDTH),
  );

  const needsPagination = items.length > itemsPerPage;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const startIndex = safeCurrentPage * itemsPerPage;
  const visibleItems = needsPagination
    ? items.slice(startIndex, startIndex + itemsPerPage)
    : items;

  const handlePreviousPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnimationDirection('backward');
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnimationDirection('forward');
    setCurrentPage((prevPage) => Math.min(totalPages - 1, prevPage + 1));
  };

  const slideOffset = availableWidth;

  const variants = {
    enter: (direction: AnimationDirection) => ({
      x: direction === 'forward' ? slideOffset : -slideOffset,
    }),
    center: {
      x: 0,
    },
    exit: (direction: AnimationDirection) => ({
      x: direction === 'forward' ? -slideOffset : slideOffset,
    }),
  };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {shouldShowLegend && (
        <StyledLegendMotionWrapper
          variants={legendEnterExitVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: theme.animation.duration.normal,
            ease: 'easeInOut',
          }}
        >
          <StyledLegendContainer
            ref={containerRef}
            needsPagination={needsPagination}
          >
            <NodeDimensionEffect
              elementRef={containerRef}
              onDimensionChange={({ width }) => {
                const newItemsPerPage = Math.max(
                  1,
                  Math.floor(
                    (width - LEGEND_PAGINATION_CONTROLS_WIDTH) /
                      LEGEND_ITEM_ESTIMATED_WIDTH,
                  ),
                );

                if (newItemsPerPage !== itemsPerPage) {
                  setCurrentPage(0);
                }

                setContainerWidth(width);
              }}
            />
            {needsPagination && (
              <StyledPaginationContainer>
                <LightIconButton
                  onClick={handlePreviousPage}
                  disabled={safeCurrentPage === 0}
                  Icon={IconChevronLeft}
                  accent="tertiary"
                />
                <StyledPaginationIndicator>
                  {safeCurrentPage + 1}/{totalPages}
                </StyledPaginationIndicator>
                <LightIconButton
                  onClick={handleNextPage}
                  disabled={safeCurrentPage === totalPages - 1}
                  Icon={IconChevronRight}
                />
              </StyledPaginationContainer>
            )}
            <StyledAnimationClipContainer>
              <AnimatePresence
                mode="popLayout"
                custom={animationDirection}
                initial={false}
              >
                <StyledItemsWrapper
                  key={safeCurrentPage}
                  custom={animationDirection}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: theme.animation.duration.normal,
                    ease: 'easeInOut',
                  }}
                  centered={!needsPagination}
                >
                  {visibleItems.map((item) => {
                    const isHidden = graphWidgetHiddenLegendIds.includes(
                      item.id,
                    );
                    return (
                      <StyledLegendItem
                        key={item.id}
                        canShrink={!needsPagination}
                        isHidden={isHidden}
                        isInteractive={isInteractive}
                        onClick={() => toggleLegendItem(item.id)}
                        onMouseEnter={() => handleLegendItemMouseEnter(item.id)}
                        onMouseLeave={handleLegendItemMouseLeave}
                      >
                        <StyledLegendDotWrapper isHidden={isHidden}>
                          <GraphWidgetLegendDot color={item.color} />
                        </StyledLegendDotWrapper>
                        <StyledLegendLabel
                          fixedWidth={needsPagination}
                          isHidden={isHidden}
                        >
                          <OverflowingTextWithTooltip text={item.label} />
                        </StyledLegendLabel>
                      </StyledLegendItem>
                    );
                  })}
                </StyledItemsWrapper>
              </AnimatePresence>
            </StyledAnimationClipContainer>
          </StyledLegendContainer>
        </StyledLegendMotionWrapper>
      )}
    </AnimatePresence>
  );
};
