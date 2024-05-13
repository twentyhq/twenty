import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { offset, useFloating } from '@floating-ui/react';
import { Chip, ChipVariant } from 'twenty-ui';

import { AnimatedContainer } from '@/object-record/record-table/components/AnimatedContainer';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  min-width: 100%;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  max-width: 100%;
  flex: 0 1 fit-content;
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  overflow: hidden;

  &:last-child {
    flex-shrink: 1;
  }
`;

const StyledChipCount = styled(Chip)`
  flex-shrink: 0;
`;

const StyledExpandedListContainer = styled.div<{
  withBorder?: boolean;
}>`
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px ${theme.boxShadow.light}, 2px 4px 16px ${theme.boxShadow.strong}`};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme, withBorder }) =>
    withBorder &&
    css`
      outline: 1px solid ${theme.font.color.extraLight};
    `};
`;

export type ExpandableListProps = {
  anchorElement?: HTMLElement;
  forceChipCountDisplay?: boolean;
  withExpandedListBorder?: boolean;
};

export type ChildrenProperty = {
  shrink: number;
  isVisible: boolean;
};

export const ExpandableList = ({
  children,
  anchorElement,
  forceChipCountDisplay = false,
  withExpandedListBorder = false,
}: {
  children: ReactElement[];
} & ExpandableListProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);

  // Used with floating-ui if anchorElement is not provided.
  // floating-ui mentions that `useState` must be used instead of `useRef`
  // @see https://floating-ui.com/docs/useFloating#elements
  const [childrenContainerElement, setChildrenContainerElement] =
    useState<HTMLDivElement | null>(null);

  // Used with useListenClickOutside.
  const containerRef = useRef<HTMLDivElement>(null);

  const [firstHiddenChildIndex, setFirstHiddenChildIndex] = useState(
    children.length,
  );

  const hiddenChildrenCount = children.length - firstHiddenChildIndex;
  const canDisplayChipCount =
    (forceChipCountDisplay || isHovered) && hiddenChildrenCount > 0;

  const { refs, floatingStyles } = useFloating({
    // @ts-expect-error placement accepts 'start' as value even if the typing does not permit it
    placement: 'start',
    middleware: [offset({ mainAxis: -1, crossAxis: -1 })],
    elements: { reference: anchorElement ?? childrenContainerElement },
  });

  const handleChipCountClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsListExpanded(true);
  };

  const resetFirstHiddenChildIndex = useCallback(() => {
    // Recompute first hidden child
    setFirstHiddenChildIndex(children.length);
  }, [children.length]);

  useEffect(() => {
    resetFirstHiddenChildIndex();
  }, [
    isHovered,
    forceChipCountDisplay,
    children.length,
    resetFirstHiddenChildIndex,
  ]);

  useListenClickOutside({
    refs: [refs.floating],
    callback: () => setIsListExpanded(false),
  });

  useListenClickOutside({
    refs: [containerRef],
    callback: () => resetFirstHiddenChildIndex(),
  });

  const findFirstHiddenChildIndex = (
    childElement: HTMLElement | null,
    index: number,
  ) => {
    if (!childrenContainerElement || !childElement) return;

    if (
      index > 0 &&
      index < firstHiddenChildIndex &&
      childrenContainerElement.scrollWidth >
        childrenContainerElement.clientWidth &&
      childElement.offsetLeft > childrenContainerElement.clientWidth
    ) {
      setFirstHiddenChildIndex(index);
    }
  };

  return (
    <StyledContainer
      ref={containerRef}
      onMouseEnter={
        forceChipCountDisplay ? undefined : () => setIsHovered(true)
      }
      onMouseLeave={
        forceChipCountDisplay ? undefined : () => setIsHovered(false)
      }
    >
      <StyledChildrenContainer ref={setChildrenContainerElement}>
        {children.map((child, index) =>
          index < firstHiddenChildIndex ? (
            <StyledChildContainer
              key={index}
              ref={(childElement) =>
                findFirstHiddenChildIndex(childElement, index)
              }
            >
              {child}
            </StyledChildContainer>
          ) : null,
        )}
      </StyledChildrenContainer>
      {canDisplayChipCount && (
        <AnimatedContainer>
          <StyledChipCount
            label={`+${hiddenChildrenCount}`}
            variant={ChipVariant.Highlighted}
            onClick={handleChipCountClick}
          />
        </AnimatedContainer>
      )}
      {isListExpanded && (
        <DropdownMenu
          ref={refs.setFloating}
          style={floatingStyles}
          width={
            anchorElement
              ? Math.max(220, anchorElement.getBoundingClientRect().width)
              : undefined
          }
        >
          <StyledExpandedListContainer withBorder={withExpandedListBorder}>
            {children}
          </StyledExpandedListContainer>
        </DropdownMenu>
      )}
    </StyledContainer>
  );
};
