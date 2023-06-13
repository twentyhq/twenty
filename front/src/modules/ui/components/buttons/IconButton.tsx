import styled from '@emotion/styled';

const StyledIconButton = styled.button`
  align-items: center;
  background: ${(props) => props.theme.blue};
  border: none;

  border-radius: 50%;
  color: ${(props) => props.theme.text0};

  cursor: pointer;
  display: flex;
  height: 20px;

  justify-content: center;

  padding: 0;
  transition: color 0.1s ease-in-out, background 0.1s ease-in-out;
  width: 20px;

  &:disabled {
    background: ${(props) => props.theme.quaternaryBackground};
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
