import { PAGE_LAYOUT_DROPDOWN_CONTENT_MAX_HEIGHT } from '@/side-panel/pages/page-layout/constants/PageLayoutDropdownContentMaxHeight';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { styled } from '@linaria/react';

export const StyledPageLayoutDropdownContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: ${PAGE_LAYOUT_DROPDOWN_CONTENT_MAX_HEIGHT}px;
  min-height: 0;
  overflow: hidden;
`;

export const StyledPageLayoutDropdownMenuItemsContainer = styled(
  DropdownMenuItemsContainer,
)`
  flex: 1;
  min-height: 0;
`;
