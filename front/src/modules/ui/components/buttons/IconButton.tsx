import styled from '@emotion/styled';

const StyledIconButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  border: none;

  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.inverted};

  cursor: pointer;
  display: flex;
  height: 20px;

  justify-content: center;

  padding: 0;
  transition: color 0.1s ease-in-out, background 0.1s ease-in-out;
  width: 20px;

  &:disabled {
    background: ${({ theme }) => theme.background.quaternary};
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: default;
  }
`;

export function IconButton({
  icon,
  ...props
}: { icon: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <StyledIconButton {...props}>{icon}</StyledIconButton>;
}
