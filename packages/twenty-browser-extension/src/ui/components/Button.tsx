import styled from "@emotion/styled";

const StyledButton = styled.button`
  background: transparent;
  font-size: ${({theme}) => theme.font.size.lg};
  font-weight: ${({theme}) => theme.font.weight.semiBold};
  min-height:${({theme}) => theme.spacing(8)};
  padding: ${({theme}) => `${theme.spacing(1.5)} ${theme.spacing(3)}`};
  font-family: inherit;
  cursor: pointer;
  border-radius: ${({theme}) => theme.spacing(5)};
`;
type ButtonProps = {
    children: React.ReactNode
}

export const Button = ({children, ...rest}: ButtonProps) => {
   return <StyledButton {...rest}>{children}</StyledButton>
}
