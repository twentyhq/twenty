import styled from '@emotion/styled';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  hasMinHeight?: boolean;
  hasMaxHeight?: boolean;
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  min-height: ${({ hasMinHeight }) => (hasMinHeight ? '150px' : '100%')};
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '188px' : 'none')};
  overflow-y: auto;

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
  hasMinHeight,
  hasMaxHeight,
}: {
  children: React.ReactNode;
  hasMinHeight?: boolean;
  hasMaxHeight?: boolean;
}) => {
  return (
    <StyledDropdownMenuItemsExternalContainer
      hasMaxHeight={hasMaxHeight}
      hasMinHeight={hasMinHeight}
    >
      {hasMaxHeight ? (
        <StyledScrollWrapper contextProviderName="dropdownMenuItemsContainer">
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
