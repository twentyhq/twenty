import styled from '@emotion/styled';

export const StyledNavigationMenuItemIconContainer = styled.div<{
  $backgroundColor?: string;
}>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4.5)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4.5)};

  ${({ $backgroundColor }) =>
    $backgroundColor ? `background-color: ${$backgroundColor};` : ''}
`;
