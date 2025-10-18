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

const StyledScrollableContainer = styled.div<{
  maxHeight?: number;
  hideScrollbar?: boolean;
}>`
  box-sizing: border-box;

  display: flex;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};
  width: 100%;

  overflow-y: auto;

  /* optionally hide native scrollbars across browsers when requested */
  ${({ hideScrollbar }) =>
    hideScrollbar
      ? `
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  `
      : ''}
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
  hideScrollbar = false,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  scrollable?: boolean;
  hideScrollbar?: boolean;
}) => {
  return scrollable === true ? (
    <StyledScrollableContainer
      maxHeight={
        hasMaxHeight ? DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT : undefined
      }
      hideScrollbar={hideScrollbar}
      data-scrollable="true"
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
