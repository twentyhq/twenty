import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';
import styled from '@emotion/styled';

const StyledExternalContainer = styled.div<{
  maxHeight?: number;
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};

  width: 100%;

  height: fit-content;

  padding: var(--padding);
  box-sizing: border-box;
`;

const StyledScrollableContainer = styled.div<{ maxHeight?: number }>`
  box-sizing: border-box;

  display: flex;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};
  width: 100%;

  overflow-y: auto;
  scrollbar-color: ${({ theme }) => theme.border.color.medium} transparent;
  scrollbar-width: 4px;

  *::-webkit-scrollbar-thumb {
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledInternalContainer = styled.div`
  display: flex;

  flex-direction: column;
  gap: 2px;

  height: 100%;
  width: 100%;
`;

export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
  scrollable = true,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  scrollable?: boolean;
}) => {
  return scrollable === true ? (
    <StyledScrollableContainer
      maxHeight={
        hasMaxHeight ? DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT : undefined
      }
    >
      <StyledExternalContainer role="listbox">
        <StyledInternalContainer>{children}</StyledInternalContainer>
      </StyledExternalContainer>
    </StyledScrollableContainer>
  ) : (
    <StyledExternalContainer role="listbox">
      <StyledInternalContainer>{children}</StyledInternalContainer>
    </StyledExternalContainer>
  );
};
