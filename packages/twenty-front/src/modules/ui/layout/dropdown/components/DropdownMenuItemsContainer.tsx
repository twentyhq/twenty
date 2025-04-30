import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  displayPadding?: boolean;
  hasMaxHeight?: boolean;
  width: number | 'auto';
}>`
  --padding: ${({ theme, displayPadding }) =>
    displayPadding ? theme.spacing(1) : theme.spacing(0)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '168px' : 'none')};

  padding: var(--padding);

  ${({ width }) =>
    isDefined(width) &&
    css`
      width: ${width}px;
    `}
`;

const StyledDropdownMenuItemsInternalContainer = styled.div`
  align-items: stretch;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  width: 100%;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  margin: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

// TODO: refactor this, the dropdown should handle the max height behavior + scroll with the size middleware
// We should instead create a DropdownMenuItemsContainerScrollable or take for granted that it is the default behavior
export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight = false,
  className,
  width = 200,
  scrollable = true,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  className?: string;
  scrollable?: boolean;
  width?: number | 'auto';
}) => {
  const id = useId();

  if (scrollable || hasMaxHeight) {
    return (
      <StyledScrollWrapper
        componentInstanceId={`scroll-wrapper-dropdown-menu-${id}`}
      >
        <StyledDropdownMenuItemsExternalContainer
          className={className}
          role="listbox"
          width={width}
          hasMaxHeight
        >
          <StyledDropdownMenuItemsInternalContainer>
            {children}
          </StyledDropdownMenuItemsInternalContainer>
        </StyledDropdownMenuItemsExternalContainer>
      </StyledScrollWrapper>
    );
  }

  return (
    <StyledDropdownMenuItemsExternalContainer
      className={className}
      role="listbox"
      width={width}
      displayPadding
    >
      <StyledDropdownMenuItemsInternalContainer>
        {children}
      </StyledDropdownMenuItemsInternalContainer>
    </StyledDropdownMenuItemsExternalContainer>
  );
};
