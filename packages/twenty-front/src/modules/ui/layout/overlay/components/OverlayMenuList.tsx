import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { type ReactNode, type Ref } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{ widthInPixels: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${({ widthInPixels }) => widthInPixels}px;
`;

const StyledScrollableContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  max-height: ${DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT}px;
  overflow-y: auto;
  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: thin;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.pill};
  }
`;

const StyledItems = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  height: fit-content;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

type OverlayMenuListProps = {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  width?: number;
  ref?: Ref<HTMLDivElement>;
};

export const OverlayMenuList = ({
  children,
  header,
  footer,
  width = GenericDropdownContentWidth.Medium,
  ref,
}: OverlayMenuListProps) => (
  <StyledContainer ref={ref} widthInPixels={width}>
    {header}
    {isDefined(children) && (
      <StyledScrollableContainer>
        <StyledItems>{children}</StyledItems>
      </StyledScrollableContainer>
    )}
    {footer}
  </StyledContainer>
);
