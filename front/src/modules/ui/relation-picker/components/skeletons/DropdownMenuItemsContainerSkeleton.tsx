import styled from '@emotion/styled';

export const DropdownMenuItemsContainerSkeleton = styled.div`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;

  border-radius: ${({ theme }) => theme.border.radius.sm};

  color: blue;

  height: calc(100% - 2 * var(--vertical-padding));

  padding: var(--vertical-padding) var(--horizontal-padding);
  width: calc(100% - 2 * var(--horizontal-padding));
`;
