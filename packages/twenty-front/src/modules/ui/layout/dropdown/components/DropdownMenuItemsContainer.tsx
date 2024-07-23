import styled from '@emotion/styled';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useDropDownTopPosition } from '@/ui/layout/dropdown/hooks/useDropDownTopPosition';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  hasMaxHeight?: boolean;
  top: number | undefined;
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  max-height: ${({ hasMaxHeight, top }) =>
    hasMaxHeight ? '188px' : `calc(100vh - ${String(top)}px - 63px)`};
  overflow-y: scroll;
  padding: var(--padding);

  width: calc(100% - 2 * var(--padding));
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  width: 100%;
`;

const StyledDropdownMenuItemsInternalContainer = styled.div`
  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  width: 100%;
`;

export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
}) => {
  const { dropDownTopPosition, dropdownRef } = useDropDownTopPosition();

  return (
    <StyledDropdownMenuItemsExternalContainer
      top={dropDownTopPosition}
      ref={dropdownRef}
      hasMaxHeight={hasMaxHeight}
    >
      {hasMaxHeight ? (
        <StyledScrollWrapper>
          <StyledDropdownMenuItemsInternalContainer>
            {children}
          </StyledDropdownMenuItemsInternalContainer>
        </StyledScrollWrapper>
      ) : (
        <StyledDropdownMenuItemsInternalContainer>
          {children}
        </StyledDropdownMenuItemsInternalContainer>
      )}
    </StyledDropdownMenuItemsExternalContainer>
  );
};
