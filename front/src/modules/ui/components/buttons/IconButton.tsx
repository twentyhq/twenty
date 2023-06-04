import styled from '@emotion/styled';

const StyledIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;

  padding: 0;
  border: none;
  border-radius: 50%;

  background: ${(props) => props.theme.text80};
  color: ${(props) => props.theme.text100};

  transition: color 0.1s ease-in-out, background 0.1s ease-in-out;

  background: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.text0};
  cursor: pointer;

  &:disabled {
    background: ${(props) => props.theme.quadraryBackground};
    color: ${(props) => props.theme.text80};
    cursor: default;
  }
`;

export function IconButton({
  icon,
  ...props
}: { icon: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <StyledIconButton {...props}>{icon}</StyledIconButton>;
}
