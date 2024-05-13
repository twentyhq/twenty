import { ReactElement, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { offset, useFloating } from '@floating-ui/react';
import { Chip, ChipVariant } from 'twenty-ui';

import { AnimatedContainer } from '@/object-record/record-table/components/AnimatedContainer';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  max-width: 100%;
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
  // floating-ui mentions that `useState` must be used instead of `useRef`,
  // see https://floating-ui.com/docs/useFloating#elements
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(false);

  const { refs, floatingStyles } = useFloating({
    // @ts-expect-error placement accepts 'start' as value even if the typing does not permit it
    placement: 'start',
    middleware: [offset({ mainAxis: -1, crossAxis: -1 })],
    elements: { reference: anchorElement ?? containerElement },
  });

  const expandList = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsListExpanded(true);
  };

  const [firstHiddenChildIndex, setFirstHiddenChildIndex] = useState(
    children.length + 1,
  );

  const hiddenChildrenCount = children.length - firstHiddenChildIndex;
  const canDisplayChipCount =
    (forceChipCountDisplay || isHovered) && hiddenChildrenCount > 0;

  useEffect(() => {
    // Recompute first hidden child
    setFirstHiddenChildIndex(children.length + 1);
  }, [isHovered, forceChipCountDisplay, children.length]);

  useEffect(() => {
    if (!forceChipCountDisplay && !isHovered) {
      setIsListExpanded(false);
    }
  }, [forceChipCountDisplay, isHovered]);

  return (
    <StyledContainer
      onMouseEnter={
        forceChipCountDisplay ? undefined : () => setIsHovered(true)
      }
      onMouseLeave={
        forceChipCountDisplay ? undefined : () => setIsHovered(false)
      }
    >
      <StyledChildrenContainer ref={setContainerElement}>
        {children.map((child, index) =>
          index < firstHiddenChildIndex ? (
            <StyledChildContainer
              key={index}
              ref={(childElement) => {
                if (!containerElement || !childElement) return;

                if (childElement.offsetLeft > containerElement.clientWidth) {
                  setFirstHiddenChildIndex((previousIndex) =>
                    previousIndex > index ? index : previousIndex,
                  );
                }
              }}
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
            onClick={expandList}
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
