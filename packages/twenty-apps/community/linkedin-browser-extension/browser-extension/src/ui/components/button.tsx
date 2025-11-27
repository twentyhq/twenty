import styled from "@emotion/styled";
import type { ComponentPropsWithRef } from "react";

const StyledButton = styled.button`
  --hover-bg-color: #378fe91a;
  --hover-color: #004182;
  --hover-border-color: #004182;
  --text-color: #0a66c2;
  --bg-color: #00000000;


  font-size: ${({theme}) => theme.spacing(3.5)};
  font-weight: ${({theme}) => theme.font.weight.semiBold};
  font-family: ${({theme}) => theme.font.family};

  background-color: var(--bg-color);
  min-height:${({theme}) => theme.spacing(8)};
  padding: ${({theme}) => `${theme.spacing(1.5)} ${theme.spacing(4)}`};
  color: var(--text-color);
  cursor: pointer;

  border-radius: ${({theme}) => theme.spacing(5)};
  border: 1px solid var(--text-color);

  transition-property: background-color, box-shadow, color;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
  transition-duration: 167ms;


  &:hover {
    background-color: var(--hover-bg-color);
    color: var(--hover-color);
    box-shadow: inset 0px 0px 0px 1px var(--hover-border-color);
  }

  @media(max-width: 990px) {
    width: 100%;
  }
`;

const StyledSpan = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
`
interface ButtonProps extends ComponentPropsWithRef<'button'> {
  children: React.ReactNode
}

export const Button = ({children, ...rest}: ButtonProps) => {
   return <StyledButton {...rest}><StyledSpan>{children}</StyledSpan></StyledButton>
}
