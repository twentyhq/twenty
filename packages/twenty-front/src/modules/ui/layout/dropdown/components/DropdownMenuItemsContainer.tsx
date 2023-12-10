import styled from '@emotion/styled';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  hasMaxHeight?: boolean;
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '180px' : 'none')};
  overflow-y: auto;

  padding: var(--padding);
  padding-right: 0;

  width: calc(100% - 1 * var(--padding));
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
  return (
    <StyledDropdownMenuItemsExternalContainer hasMaxHeight={hasMaxHeight}>
      <StyledScrollWrapper>
        <StyledDropdownMenuItemsInternalContainer>
          {children}
        </StyledDropdownMenuItemsInternalContainer>
      </StyledScrollWrapper>
    </StyledDropdownMenuItemsExternalContainer>
  );
};
