import { ResetPaginationOnItemsPerPageChangeEffect } from '@/page-layout/widgets/graph/components/ResetPaginationOnItemsPerPageChangeEffect';
import { LEGEND_ITEM_ESTIMATED_WIDTH } from '@/page-layout/widgets/graph/constants/LegendItemEstimatedWidth.constant';
import { LEGEND_LABEL_MAX_WIDTH } from '@/page-layout/widgets/graph/constants/LegendLabelMaxWidth.constant';
import { LEGEND_PAGINATION_CONTROLS_WIDTH } from '@/page-layout/widgets/graph/constants/LegendPaginationControlsWidth.constant';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
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

const StyledAnimationClipContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const StyledDot = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

const StyledItemsWrapper = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: nowrap;
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

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  flex-shrink: 0;
`;

const StyledLegendLabel = styled.div<{ width: number }>`
  color: ${({ theme }) => theme.font.color.light};
  width: ${({ width }) => width}px;
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

export const GraphWidgetLegend = ({
  items,
  show = true,
}: GraphWidgetLegendProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [containerWidth, setContainerWidth] = useState(0);

  const [animationDirection, setAnimationDirection] = useState<
    'forward' | 'backward'
  >('forward');

  const theme = useTheme();

  const isItASingleItem = items.length === 1;
  const thereAreNoItems = items.length === 0;

  const shouldShowLegend = show && !isItASingleItem && !thereAreNoItems;

  if (!shouldShowLegend) {
    return null;
  }

  const availableWidthForItems =
    containerWidth - LEGEND_PAGINATION_CONTROLS_WIDTH;

  const itemsPerPage = Math.max(
    1,
    Math.floor(availableWidthForItems / LEGEND_ITEM_ESTIMATED_WIDTH),
  );

  const needsPagination = items.length > itemsPerPage;

  const effectiveItemsPerPage = needsPagination
    ? itemsPerPage
    : Math.max(1, Math.floor(containerWidth / LEGEND_ITEM_ESTIMATED_WIDTH));

  const totalPages = Math.ceil(items.length / effectiveItemsPerPage);

  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const startIndex = safeCurrentPage * effectiveItemsPerPage;
  const endIndex = startIndex + effectiveItemsPerPage;

  const visibleItems = needsPagination
    ? items.slice(startIndex, endIndex)
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

  const slideOffset = availableWidthForItems;

  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? slideOffset : -slideOffset,
    }),
    center: {
      x: 0,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -slideOffset : slideOffset,
    }),
  };

  return (
    <StyledLegendContainer ref={containerRef} needsPagination={needsPagination}>
      <NodeDimensionEffect
        elementRef={containerRef}
        onDimensionChange={({ width }) => {
          setContainerWidth(width);
        }}
      />
      <ResetPaginationOnItemsPerPageChangeEffect
        itemsPerPage={effectiveItemsPerPage}
        onReset={() => setCurrentPage(0)}
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
          >
            {visibleItems.map((item) => (
              <StyledLegendItem key={item.id}>
                <StyledDot color={item.color} />
                <StyledLegendLabel width={LEGEND_LABEL_MAX_WIDTH}>
                  <OverflowingTextWithTooltip text={item.label} />
                </StyledLegendLabel>
              </StyledLegendItem>
            ))}
          </StyledItemsWrapper>
        </AnimatePresence>
      </StyledAnimationClipContainer>
    </StyledLegendContainer>
  );
};
