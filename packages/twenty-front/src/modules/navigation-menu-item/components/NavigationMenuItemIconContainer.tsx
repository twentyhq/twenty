import styled from '@emotion/styled';

export const StyledNavigationMenuItemIconContainer = styled.div<{
  $backgroundColor?: string;
  $borderColor?: string;
}>`
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};

  ${({ $backgroundColor }) =>
    $backgroundColor ? `background-color: ${$backgroundColor};` : ''}
  ${({ $borderColor }) =>
    $borderColor ? `border: 1px solid ${$borderColor};` : ''}
`;
