import { useCallback } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPlus } from '@/ui/icons/index';

const StyledButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.primaryBackground};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.text40};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${(props) => props.theme.spacing(1)};

  &:hover {
    background-color: ${({ theme }) => theme.secondaryBackground};
  }
`;

export const NewButton = ({
  onClick,
}: {
  onClick?: (...args: any[]) => void;
}) => {
  const theme = useTheme();
  const onInnerClick = useCallback(() => {
    onClick && onClick({ id: 'twenty-aaffcfbd-f86b-419f-b794-02319abe8637' });
  }, [onClick]);
  return (
    <StyledButton onClick={onInnerClick}>
      <IconPlus size={theme.iconSizeMedium} />
      New
    </StyledButton>
  );
};
