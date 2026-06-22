import { styled } from '@linaria/react';
import {
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ExpandableListResizeEffect } from '@/ui/layout/expandable-list/components/ExpandableListResizeEffect';
import { ExpandedListDropdown } from '@/ui/layout/expandable-list/components/ExpandedListDropdown';
import { isFirstOverflowingChildElement } from '@/ui/layout/expandable-list/utils/isFirstOverflowingChildElement';
import { isDefined } from 'twenty-shared/utils';
import { ChipSize } from 'twenty-ui/data-display';
import { AnimatedContainer } from 'twenty-ui/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  min-width: 100%;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  max-width: 100%;
  flex: 0 1 fit-content;
  position: relative; // Needed so children elements compute their offsetLeft relatively to this element.
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  overflow: hidden;

  &:last-child {
    flex-shrink: 1;
  }
`;

const StyledUnShrinkableContainer = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;

  width: 24px;
`;

export type ExpandableListProps = {
  isChipCountDisplayed?: boolean;
};

export type ChildrenProperty = {
  shrink: number;
  isVisible: boolean;
};

export const ExpandableList = ({
  children,
  isChipCountDisplayed: isChipCountDisplayedFromProps,
}: {
  children: ReactElement[];
} & ExpandableListProps) => {
  // isChipCountDisplayedInternal => uncontrolled display of the chip count.
  // isChipCountDisplayedFromProps => controlled display of the chip count.
  // If isChipCountDisplayedFromProps is provided, isChipCountDisplayedInternal is not taken into account.
  const [isChipCountDisplayedInternal, setIsChipCountDisplayedInternal] =
    useState(false);
  const isChipCountDisplayed = isDefined(isChipCountDisplayedFromProps)
    ? isChipCountDisplayedFromProps
    : isChipCountDisplayedInternal;

  const [isListExpanded, setIsListExpanded] = useState(false);

  // Used with floating-ui if anchorElement is not provided.
  // floating-ui mentions that `useState` must be used instead of `useRef`
  // @see https://floating-ui.com/docs/useFloating#elements
  const [childrenContainerElement, setChildrenContainerElement] =
    useState<HTMLDivElement | null>(null);

  const [previousChildrenContainerWidth, setPreviousChildrenContainerWidth] =
    useState(childrenContainerElement?.clientWidth ?? 0);

  const containerRef = useRef<HTMLDivElement>(null);

  const [firstHiddenChildIndex, setFirstHiddenChildIndex] = useState(
    children.length,
  );

  const hiddenChildrenCount = children.length - firstHiddenChildIndex;
  const canDisplayChipCount = isChipCountDisplayed && hiddenChildrenCount > 0;

  const visibleChildren = isChipCountDisplayed
    ? children.slice(0, firstHiddenChildIndex)
    : children;

  const handleChipCountClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsListExpanded(true);
  }, []);

  const resetFirstHiddenChildIndex = useCallback(() => {
    setFirstHiddenChildIndex(children.length);
  }, [children.length]);

  useEffect(() => {
    resetFirstHiddenChildIndex();
  }, [isChipCountDisplayed, children.length, resetFirstHiddenChildIndex]);

  const handleClickOutside = () => {
    setIsListExpanded(false);

    if (
      childrenContainerElement?.clientWidth !== previousChildrenContainerWidth
    ) {
      resetFirstHiddenChildIndex();
      setPreviousChildrenContainerWidth(
        childrenContainerElement?.clientWidth ?? 0,
      );
    }
  };

  return (
    <StyledContainer
      ref={containerRef}
      onMouseEnter={
        isChipCountDisplayedFromProps
          ? undefined
          : () => setIsChipCountDisplayedInternal(true)
      }
      onMouseLeave={
        isChipCountDisplayedFromProps
          ? undefined
          : () => setIsChipCountDisplayedInternal(false)
      }
    >
      {isChipCountDisplayed && (
        <ExpandableListResizeEffect
          containerRef={containerRef}
          onContainerWidthChange={resetFirstHiddenChildIndex}
        />
      )}
      <StyledChildrenContainer ref={setChildrenContainerElement}>
        {visibleChildren.map((child, index) => (
          <StyledChildContainer
            key={index}
            ref={
              isChipCountDisplayed
                ? (childElement) => {
                    if (
                      index > 0 &&
                      isFirstOverflowingChildElement({
                        containerElement: childrenContainerElement,
                        childElement,
                      })
                    ) {
                      setFirstHiddenChildIndex(index);
                    }
                  }
                : undefined
            }
          >
            {child}
          </StyledChildContainer>
        ))}
      </StyledChildrenContainer>
      {canDisplayChipCount && (
        <AnimatedContainer>
          <StyledUnShrinkableContainer onClick={handleChipCountClick}>
            <OverflowingTextWithTooltip
              text={`+${hiddenChildrenCount}`}
              size={ChipSize.Small}
            />
          </StyledUnShrinkableContainer>
        </AnimatedContainer>
      )}
      {isListExpanded && (
        <ExpandedListDropdown
          anchorElement={containerRef.current ?? undefined}
          onClickOutside={handleClickOutside}
        >
          {children}
        </ExpandedListDropdown>
      )}
    </StyledContainer>
  );
};
