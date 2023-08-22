import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { isRightDrawerExpandedState } from '@/ui/right-drawer/states/isRightDrawerExpandedState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { Chip, ChipVariant } from '../chip/components/Chip';

type OwnProps = {
  isOverflowOpen: boolean;
  width: number;
};

const StyledContainer = styled.div<Partial<OwnProps>>`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
  max-width: calc(100vw - 265px);
  overflow: hidden;
  padding: ${({ isOverflowOpen, theme }) =>
    isOverflowOpen ? theme.spacing(4) : theme.spacing(1)};
  width: ${({ width }) => (width === 0 ? '100%' : `${width}px`)};
`;

const StyledOverflowContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  z-index: 9999;
`;

export function OverflowingChipsWithTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleItems, setVisibleItems] = useState<React.ReactNode[]>([]);
  const [remaningItems, setRemaningItems] = useState(0);

  const [isNavOpen] = useRecoilState(isNavbarOpenedState);
  const [isRightDrawerExpanded] = useRecoilState(isRightDrawerExpandedState);

  useEffect(() => {
    const element = containerRef?.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === containerRef.current) {
          setContainerWidth(entry.contentRect.width);
        }
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      // setContainerWidth(0);
      resizeObserver.disconnect();
    };
  }, [isNavOpen, isRightDrawerExpanded]);

  const handleOverflowButtonClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setIsOverflowOpen(true);
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: () => {
      setIsOverflowOpen(false);
    },
  });

  useEffect(() => {
    const items = React.Children.toArray(children);

    const itemWidth = 14 + 60; //icon width + assumed text width
    const totalVisibleItems = items.slice(0, containerWidth / itemWidth);

    setVisibleItems(totalVisibleItems);
  }, [children, containerWidth]);

  useEffect(() => {
    const remainingItemsLength =
      React.Children.toArray(children).length - visibleItems.length;

    setRemaningItems(remainingItemsLength);
  }, [children, visibleItems]);

  return (
    <StyledContainer
      ref={containerRef}
      isOverflowOpen={isOverflowOpen}
      width={containerWidth}
    >
      {isOverflowOpen ? (
        <StyledOverflowContainer>{children}</StyledOverflowContainer>
      ) : (
        <>
          {visibleItems}

          {remaningItems !== 0 && (
            <div
              onClick={(e) => {
                handleOverflowButtonClick(e);
              }}
            >
              <Chip
                label={`+${remaningItems}`}
                variant={ChipVariant.Highlighted}
              />
            </div>
          )}
        </>
      )}
    </StyledContainer>
  );
}
