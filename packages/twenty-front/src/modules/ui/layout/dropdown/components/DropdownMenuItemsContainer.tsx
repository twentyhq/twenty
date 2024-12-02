import styled from '@emotion/styled';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  hasMaxHeight?: boolean;
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '188px' : 'none')};

  padding: var(--padding);

  width: calc(100% - 2 * var(--padding));
`;

const StyledDropdownMenuItemsInternalContainer = styled.div`
  align-items: stretch;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  width: 100%;
`;

// TODO: refactor this, the dropdown should handle the max height behavior + scroll with the size middleware
// We should instead create a DropdownMenuItemsContainerScrollable or take for granted that it is the default behavior
export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
  className,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  className?: string;
}) => {
  return (
    <StyledDropdownMenuItemsExternalContainer
      hasMaxHeight={hasMaxHeight}
      className={className}
    >
      <StyledDropdownMenuItemsInternalContainer>
        {children}
      </StyledDropdownMenuItemsInternalContainer>
    </StyledDropdownMenuItemsExternalContainer>
  );
};
