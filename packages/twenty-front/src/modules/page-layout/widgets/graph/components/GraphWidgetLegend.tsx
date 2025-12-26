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
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

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

const StyledLegendMotionWrapper = styled(motion.div)`
  width: 100%;
`;

const StyledItemsWrapper = styled(motion.div)<{ centered?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
  justify-content: ${({ centered }) => (centered ? 'center' : 'flex-start')};
`;

const StyledLegendContainer = styled.div<{ needsPagination: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: ${({ needsPagination }) =>
    needsPagination ? 'flex-start' : 'center'};
  padding-top: ${({ theme }) => theme.spacing(3)};
  overflow: hidden;
  width: 100%;
  align-items: center;
`;

const StyledLegendItem = styled.div<{
  canShrink?: boolean;
  isHidden?: boolean;
  isInteractive?: boolean;
}>`
  align-items: center;
  cursor: ${({ isInteractive }) => (isInteractive ? 'pointer' : 'default')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  flex-shrink: ${({ canShrink }) => (canShrink ? 1 : 0)};
  min-width: 0;
`;

const StyledLegendLabel = styled.div<{
  fixedWidth?: boolean;
  isHidden?: boolean;
}>`
  color: ${({ theme }) => theme.font.color.secondary};
  ${({ fixedWidth }) => fixedWidth && `width: ${LEGEND_LABEL_MAX_WIDTH}px;`}
  overflow: hidden;
  text-decoration: ${({ isHidden }) => (isHidden ? 'line-through' : 'none')};
  opacity: ${({ isHidden }) =>
    isHidden ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1};

  :hover {
    opacity: 1;
  }
`;

const StyledLegendDot = styled(GraphWidgetLegendDot)<{ isHidden?: boolean }>`
  opacity: ${({ isHidden }) =>
    isHidden ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1};
`;

const StyledPaginationContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledPaginationIndicator = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [containerWidth, setContainerWidth] = useState(0);

  const [animationDirection, setAnimationDirection] =
    useState<AnimationDirection>('forward');

  const theme = useTheme();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const isInteractive = !isPageLayoutInEditMode;

  const setHighlightedLegendId = useSetRecoilComponentState(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const [hiddenLegendIds, setHiddenLegendIds] = useRecoilComponentState(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const itemIds = items.map((item) => item.id);

  const { toggleLegendItem } = useLegendItemToggle({
    itemIds,
    isInteractive,
  });

  if (isPageLayoutInEditMode && hiddenLegendIds.length > 0) {
    setHiddenLegendIds([]);
  }

  const handleLegendItemMouseEnter = (itemId: string) => {
    if (!isInteractive) {
      return;
    }
    setHighlightedLegendId(itemId);
  };

  const handleLegendItemMouseLeave = () => {
    if (!isInteractive) {
      return;
    }
    setHighlightedLegendId(null);
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
                    const isHidden = hiddenLegendIds.includes(item.id);
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
                        <StyledLegendDot
                          color={item.color}
                          isHidden={isHidden}
                        />
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
