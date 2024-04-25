import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { Chip, ChipVariant, IconPencil } from 'twenty-ui';

import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu.tsx';
const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledChipContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledChildContainer = styled.div<{
  shrink: number;
  isVisible?: boolean;
  isHovered?: boolean;
}>`
  flex-shrink: ${({ shrink }) => shrink};
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  overflow: ${({ isHovered }) => (isHovered ? 'hidden' : 'none')};
`;

const StyledRelationsListContainer = styled.div`
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  box-shadow: '0px 2px 4px ${({ theme }) =>
    theme.boxShadow.light}, 2px 4px 16px ${({ theme }) =>
    theme.boxShadow.strong}';
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const ExpandableCell = ({
  children,
  isHovered,
  reference,
}: {
  children: ReactElement[];
  isHovered?: boolean;
  reference?: HTMLDivElement;
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const [childrenContainerWidth, setChildrenContainerWidth] = useState<
    Record<number, number>
  >({});

  const chipContainerWidth = 52;

  const computeChildProperties = (index: number) => {
    const availableWidth = containerWidth - chipContainerWidth;
    const childWidth = childrenContainerWidth[index];
    const cumulatedChildrenWidth = Array.from(Array(index).keys()).reduce(
      (acc, currentIndex) => acc + childrenContainerWidth[currentIndex],
      0,
    );
    if (!isHovered) {
      return { shrink: 1, isVisible: true };
    }
    if (cumulatedChildrenWidth > availableWidth) {
      return { shrink: 1, isVisible: false };
    }
    if (cumulatedChildrenWidth + childWidth <= availableWidth) {
      return { shrink: 0, isVisible: true };
    }
    return { shrink: 1, isVisible: true };
  };

  const computeHiddenChildrenNumber = () => {
    const childrenContainerWidthValues = Object.values(childrenContainerWidth);
    let result = 0;
    let cumulatedWidth = 0;
    childrenContainerWidthValues.forEach((childrenContainerWidthValue) => {
      cumulatedWidth += childrenContainerWidthValue;
      if (cumulatedWidth > containerWidth - chipContainerWidth) {
        result += 1;
      }
    });
    return Math.max(result - 1, 0);
  };

  const hiddenChildrenCount = computeHiddenChildrenNumber();

  const { refs, floatingStyles } = useFloating({
    // @ts-expect-error placement accepts 'start' as value even if the typing does not permit it
    placement: 'start',
    elements: { reference },
    //middleware: [offset({ crossAxis: -1, mainAxis: -1 })],
  });

  const openDropdownMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownMenuOpen(true);
  };

  return (
    <StyledContainer
      ref={(el) => {
        if (!el || containerWidth > 0) return;
        setContainerWidth(el.getBoundingClientRect().width);
      }}
    >
      <StyledChildrenContainer>
        {children.map((child, index) => {
          const childProperties = computeChildProperties(index);
          return (
            <StyledChildContainer
              ref={(el) => {
                if (!el || childrenContainerWidth[index] > 0) return;
                setChildrenContainerWidth((prevState) => {
                  prevState[index] = el.getBoundingClientRect().width;
                  return prevState;
                });
              }}
              key={index}
              isHovered={isHovered}
              isVisible={childProperties.isVisible}
              shrink={childProperties.shrink}
            >
              {child}
            </StyledChildContainer>
          );
        })}
      </StyledChildrenContainer>
      {isHovered && (
        <StyledChipContainer>
          {hiddenChildrenCount > 0 && (
            <Chip
              label={`+${hiddenChildrenCount}`}
              variant={ChipVariant.Highlighted}
              onClick={openDropdownMenu}
            />
          )}

          <FloatingIconButton Icon={IconPencil} />
        </StyledChipContainer>
      )}
      {isDropdownMenuOpen && (
        <DropdownMenu
          ref={refs.setFloating}
          style={floatingStyles}
          width={
            reference ? reference.getBoundingClientRect().width : undefined
          }
        >
          <StyledRelationsListContainer>
            {children}
          </StyledRelationsListContainer>
        </DropdownMenu>
      )}
    </StyledContainer>
  );
};
