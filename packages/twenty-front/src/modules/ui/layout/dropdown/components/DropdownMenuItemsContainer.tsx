import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledExternalContainer = styled.div<{
  maxHeight?: number;
}>`
  --dropdown-menu-items-padding: ${themeCssVariables.spacing[1]};
  --dropdown-menu-items-row-gap: 2px;

  align-items: flex-start;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  height: fit-content;

  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};

  padding: var(--dropdown-menu-items-padding);
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
    border-radius: ${themeCssVariables.border.radius.pill};
  }
`;

const StyledInternalContainer = styled.div`
  display: flex;

  flex-direction: column;
  gap: var(--dropdown-menu-items-row-gap);

  height: 100%;
  width: 100%;

  > [data-dropdown-menu-section-label],
  > [data-dropdown-menu-separator] {
    margin-left: calc(0px - var(--dropdown-menu-items-padding));
    margin-right: calc(0px - var(--dropdown-menu-items-padding));
    width: calc(
      100% + var(--dropdown-menu-items-padding) +
        var(--dropdown-menu-items-padding)
    );
  }

  > [data-dropdown-menu-section-label]:first-child {
    margin-top: calc(0px - var(--dropdown-menu-items-padding));
  }

  > [data-dropdown-menu-section-label] + * {
    margin-top: calc(
      var(--dropdown-menu-items-padding) - var(--dropdown-menu-items-row-gap)
    );
  }

  > [data-dropdown-menu-separator] + [data-dropdown-menu-section-label] {
    margin-top: calc(0px - var(--dropdown-menu-items-row-gap));
  }
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
