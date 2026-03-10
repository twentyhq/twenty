import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledExternalContainer = styled.div<{
  maxHeight?: number;
}>`
  --padding: ${themeCssVariables.spacing[1]};

  align-items: flex-start;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  height: fit-content;

  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};

  padding: var(--padding);
  width: 100%;
`;

const StyledScrollableContainer = styled.div<{ maxHeight?: number }>`
  box-sizing: border-box;

  display: flex;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};
  overflow-y: auto;

  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: 4px;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.sm};
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
  className,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  scrollable?: boolean;
  className?: string;
}) => {
  return scrollable === true ? (
    <StyledScrollableContainer
      className={className}
      maxHeight={
        hasMaxHeight ? DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT : undefined
      }
    >
      <StyledExternalContainer role="listbox">
        <StyledInternalContainer>{children}</StyledInternalContainer>
      </StyledExternalContainer>
    </StyledScrollableContainer>
  ) : (
    <StyledExternalContainer role="listbox" className={className}>
      <StyledInternalContainer>{children}</StyledInternalContainer>
    </StyledExternalContainer>
  );
};
