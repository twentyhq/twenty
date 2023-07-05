import styled from '@emotion/styled';

export const DropdownMenuItemContainerSkeleton = styled.div`
  --horizontal-padding: ${({ theme }) => theme.spacing(1.5)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  align-items: center;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};

  font-size: ${({ theme }) => theme.font.size.sm};

  gap: ${({ theme }) => theme.spacing(2)};

  height: calc(100% - 2 * var(--vertical-padding));

  padding: var(--vertical-padding) var(--horizontal-padding);
  width: calc(100% - 2 * var(--horizontal-padding));
`;
